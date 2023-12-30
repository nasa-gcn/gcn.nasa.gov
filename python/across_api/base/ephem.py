# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from functools import cached_property
from typing import Optional, Type

import astropy.units as u  # type: ignore
import numpy as np
from astropy.coordinates import TEME  # type: ignore
from astropy.coordinates import AltAz  # type: ignore
from astropy.coordinates import CartesianDifferential  # type: ignore
from astropy.coordinates import (
    GCRS,
    CartesianRepresentation,
    EarthLocation,
    SkyCoord,
    get_body,
)
from astropy.time import Time  # type: ignore
from erfa import pn, pxp  # type: ignore
from fastapi import HTTPException
from sgp4.api import Satrec  # type: ignore

from ..base.schema import EphemGetSchema, EphemSchema
from .common import ACROSSAPIBase
from .tle import TLEBase, TLEEntry

# Constants
EARTH_RADIUS = 6371  # km. Note this is average radius, as Earth is not a sphere.


class EphemBase(ACROSSAPIBase):
    """
    Base class for computing ephemeris data, for spacecraft whose positions can
    be determined using a Two-Line Element (TLE) file, i.e. most Earth-orbiting
    spacecraft. This ephemeris primarily calculates the position of the
    spacecraft in GCRS coordinates. It also calculates the position of the Sun
    and Moon in GCRS coordinates, and the latitude and longitude of the
    spacecraft over the Earth.

    The design of this ephemeris class is based upon how actual LEO spacecraft
    ephemeris calculations work, and therefore is designed to mimic constraints
    calculated onboard a spacecraft, to as closely match and predict those as
    possible.

    Parameters
    ----------
    begin
        The start time of the ephemeris.
    end
        The end time of the ephemeris.
    stepsize
        The time step size in seconds. Default is 60.

    Attributes
    ----------
    begin
        The start time of the ephemeris.
    end
        The end time of the ephemeris.
    stepsize
        The time step size in seconds.
    username
        The username for the API request.
    parallax
        Flag indicating whether to include parallax correction.
    velocity
        Flag indicating whether to calculate satellite velocity.
    apparent
        Flag indicating whether to use apparent positions for Sun and Moon.
    earth_radius
        The radius of the Earth in degrees. If not specified (None), it will be
        calculated based on the distance from the Earth to the spacecraft.
    tle
        The TLE (Two-Line Elements) data for the satellite.
    tleclass
        The spacecraft specific class for retrieving TLE data.

    Methods
    -------
    ephindex(self, t: Time)
        Returns the time index for a given time.
    get(self)
        Computes the ephemeris for the specified time range.
    """

    _schema = EphemSchema
    _get_schema = EphemGetSchema
    # Type hints
    begin: Time
    end: Time
    stepsize: int
    username: str
    parallax: bool
    velocity: bool
    apparent: bool
    earth_radius: Optional[float]
    tle: Optional[TLEEntry]
    tleclass: Type[TLEBase]

    def __init__(self, begin: Time, end: Time, stepsize: int = 60):
        # Default values
        self.tle = self.tleclass(begin).tle

        # Parse argument keywords
        self.begin = begin
        self.end = end
        self.stepsize = stepsize

        # Validate and process API call
        if self.validate_get():
            # Perform GET
            self.get()

    def __len__(self) -> int:
        return len(self.timestamp)

    def ephindex(self, t: Time) -> int:
        """For a given time, return an index for the nearest time in the ephemeris."""
        return int(np.argmin(np.abs(self.timestamp - t)))

    @cached_property
    def pole(self) -> SkyCoord:
        return SkyCoord(
            CartesianRepresentation(x=self.polevec.T),
        )

    @cached_property
    def earth(self) -> SkyCoord:
        """Earth RA/Dec"""
        return SkyCoord(
            CartesianRepresentation(x=-self.posvec.T),
        )

    @cached_property
    def tle_epoch(self) -> Optional[Time]:
        if self.tle is not None:
            return self.tle.epoch
        return None

    @cached_property
    def beta(self) -> np.ndarray:
        """Return spacecraft beta angle (angle between the plane of the orbit
        and the plane of the Sun)."""
        return np.array(self.pole.separation(self.sun).deg) - 90

    @cached_property
    def sun(self) -> SkyCoord:
        """Sun position as a SkyCoord, corrected for spacecraft parallax if requested."""
        if self.parallax:
            return SkyCoord(
                CartesianRepresentation(
                    x=self.sunvec.T - self.posvec.T,
                ),
            )
        else:
            return SkyCoord(
                CartesianRepresentation(x=self.sunvec.T),
            )

    @cached_property
    def ineclipse(self) -> np.ndarray:
        """Is the spacecraft in an Earth eclipse? Defined as when the Sun > 50% behind the Earth"""
        return self.sun.separation(self.earth) < self.earthsize * u.deg

    @cached_property
    def moon(self) -> SkyCoord:
        """Calculate moon RA/Dec and vector"""
        if self.parallax:
            # Calculate the position of the Moon from the spacecraft, not the center of the Earth
            return SkyCoord(
                CartesianRepresentation(x=self.moonvec.T - self.posvec.T),
            )
        else:
            # Calculate the position of the Moon from the center of the Earth
            return SkyCoord(
                CartesianRepresentation(x=self.moonvec.T),
            )

    def get(self) -> bool:
        """
        Compute the ephemeris for the specified time range with at a
        time resolution given by self.stepsize.

        Note only calculates Spacecraft position, velocity (optionally),
        Sun/Moon position and latitude/longitude of the spacecraft
        initially. These are stored as arrays of vectors as
        a 2xN or 3xN array of floats, in units of degrees (Lat/Lon) or km
        (position) and km/s (velocity).
        """

        # Check if all parameters are valid
        if not self.validate_get():
            # Compute Ephemeris
            return False

        # Check the TLE is available
        if self.tle is None:
            raise HTTPException(
                status_code=404, detail="No TLE available for this epoch"
            )

        # Load the TLE
        self.satellite = Satrec.twoline2rv(self.tle.tle1, self.tle.tle2)

        # Loop to create the ephemeris values for every time step
        entries = int((self.end - self.begin).to_value(u.s) / self.stepsize + 1)

        # Set up time array
        self.timestamp = self.begin + np.arange(entries) * self.stepsize * u.s

        # Calculate GCRS position for Satellite
        _, temes_p, temes_v = self.satellite.sgp4_array(
            self.timestamp.jd1, self.timestamp.jd2
        )
        teme_p = CartesianRepresentation(temes_p.T * u.km)

        # Convert SGP4 TEME data to astropy TEME data
        if self.velocity is True:
            # Calculate position with differentials, so satellite velocity can be determined
            teme_v = CartesianDifferential(temes_v.T * u.km / u.s)
            teme = TEME(teme_p.with_differentials(teme_v), obstime=self.timestamp)
        else:
            # Just calculate satellite positions (faster)
            teme = TEME(teme_p.without_differentials(), obstime=self.timestamp)
        self.gcrs = teme.transform_to(GCRS(obstime=self.timestamp))

        # Calculate satellite position vector as array of x,y,z vectors in
        # units of km
        self.posvec = self.gcrs.cartesian.xyz.to(u.km).value.T

        # Calculate the GCRS position of the Moon in km
        moon = get_body("moon", self.timestamp)

        # Use apparent position of the Moon?
        if self.apparent:
            moon = moon.tete
        self.moonvec = moon.cartesian.xyz.to(u.km).value.T

        # Calculate the GCRS position of the Sun in km
        sun = get_body("sun", self.timestamp)

        # Use apparent position of the Sun?
        if self.apparent:
            sun = sun.tete
        self.sunvec = sun.cartesian.xyz.to(u.km).value.T

        # Calculate Latitude/Longitude of spacecraft over Earth This method
        # calculates the alt/az of the spacecraft as viewed from the center of
        # the Earth. This matches lat/long well enough for the purpose we need
        # it: Determining if we're in the SAA. Accurate to within ~5 arcminutes
        # in latitude and 0.25 arcminutes in longitude (latitude variance due
        # to Earth not being spherical) FIXME: Proper calculation of Lat/Lon of
        # point below spacecraft using WGS84
        earth_centered_frame = AltAz(
            obstime=self.timestamp,
            location=EarthLocation.from_geocentric(0, 0, 0, unit="m"),
        )
        lon_lat_dist = SkyCoord(self.gcrs).transform_to(earth_centered_frame).spherical
        self.longitude = 180 - lon_lat_dist.lon.deg
        self.latitude = lon_lat_dist.lat.deg

        # Calculate Angular size of Earth in degrees, note assumes Earth is spherical
        earth_distance = lon_lat_dist.distance.to(u.km).value
        if self.earth_radius is not None:
            self.earthsize = self.earth_radius * np.ones(entries)
        else:
            self.earthsize = np.degrees(np.arcsin(EARTH_RADIUS / earth_distance))

        # Calculate satellite velocity vector (if needed). This is useful
        # for calculating the orbit pole vector (used to calculate the location
        # of pole constraints or continuous viewing zones), or the direction of
        # spacecraft motion in order to calculate a ram constraint.
        if self.velocity:
            # Calculate velocity vector
            self.velvec = self.gcrs.velocity.d_xyz.to(u.km / u.s).value.T

            # Calculate orbit pole vector
            _, uposvec = pn(self.posvec)
            _, uvelvec = pn(self.velvec)
            # The pole vector is the cross product of the unit position and velocity vectors
            # Uses erfa pxp function, which is a bit faster than numpy cross
            self.polevec = pxp(uposvec, uvelvec)

        return True
