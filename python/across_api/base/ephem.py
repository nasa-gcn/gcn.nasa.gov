# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from functools import cached_property
from typing import Optional, Tuple

import astropy.units as u  # type: ignore
import numpy as np
from astropy.coordinates import (  # type: ignore
    GCRS,
    ITRS,
    TEME,
    CartesianDifferential,
    CartesianRepresentation,
    EarthLocation,
    Latitude,
    Longitude,
    SkyCoord,
    get_body,
)
from astropy.time import Time  # type: ignore
from fastapi import HTTPException
from sgp4.api import Satrec  # type: ignore

from ..base.schema import EphemGetSchema, EphemSchema, TLEEntry
from .common import ACROSSAPIBase

# Constants
EARTH_RADIUS = 6371 * u.km  # km. Note this is average radius, as Earth is not a sphere.


class EarthSatelliteLocation:
    """
    Class to calculate the position of a satellite given a TLE.

    Note this mimics the astropy.coordinates EarthLocation class, in that it
    provides the method `get_gcrs_posvel` which returns the position and
    velocity of the satellite in GCRS coordinates. Therefore this class can be
    used by the astropy `get_body` function to set the location in place of an
    `EarthLocation` object. This way you can calculate the RA/Dec of the Moon
    and Sun as viewed from the satellite, which means effects like Moon
    parallax are correctly included.

    Also provides a method to calculate the latitude and longitude of the
    spacecraft over the Earth.

    Parameters
    ----------
    tle1 : str
        First line of the TLE
    tle2 : str
        Second line of the TLE

    Methods
    -------
    get_grcs(self, t: Time)
        Return the GCRS position and velocity for a satellite
    get_itrs(self, t: Time, location: Optional[EarthLocation] = None)
        Return the ITRS position and velocity for a satellite
    itrs(self)
        Return the ITRS position and velocity for a satellite at the default
        time
    get_gcrs_posvel(self, t: Time)
        Calculate the GCRS position and velocity of the satellite at a given
        time.
    get_lonlatdist(self, t: Time)
        Calculate the latitude/longitude of the spacecraft over the Earth, and
        the distance from the center of the Earth.
    lon(self, t: Time)
        Return the longitude of the spacecraft at a given time. Uses default
        WGS84 ellipsoid.
    lat(self, t: Time)
        Return the latitude of the spacecraft at a given time. Uses default
        WGS84 ellipsoid.
    """

    gcrs: GCRS
    satellite: Satrec
    _t: Time

    def __init__(self, tle1: str, tle2: str):
        self.satellite = Satrec.twoline2rv(tle1, tle2)

    def get_gcrs(self, t: Time) -> GCRS:
        """
        Return the GCRS position and velocity for a satellite

        Parameters
        ----------
        t : Time
            Time to calculate position for. Must be array-type.

        Returns
        -------
            GCRS position and velocity for satellite
        """
        # Check if this has been calculated before, if yes, just return cached
        # result
        if hasattr(self, "_t") and self._t is t:
            return self.gcrs

        # Store the time we've calculated for caching purposes
        self._t = t

        # Calculate GCRS position for Satellite
        _, temes_p, temes_v = self.satellite.sgp4_array(t.jd1, t.jd2)
        teme_p = CartesianRepresentation(temes_p.T * u.km)

        # Convert SGP4 TEME data to astropy TEME data
        teme_v = CartesianDifferential(temes_v.T * u.km / u.s)
        teme = TEME(teme_p.with_differentials(teme_v), obstime=t)
        self.gcrs = teme.transform_to(GCRS(obstime=t))
        return self.gcrs

    def get_itrs(self, t: Time, location: Optional[EarthLocation] = None) -> GCRS:
        """
        Return the ITRS position and velocity for a satellite

        Parameters
        ----------
        t : Time
            Time to calculate position for. Must be array-type.
        location : EarthLocation
            Location to calculate position for. If None, calculates using a
            geocentric location.

        Returns
        -------
            ITRS position and velocity for satellite
        """
        return self.get_gcrs(t).transform_to(ITRS(obstime=t, location=location))

    @property
    def itrs(self) -> ITRS:
        """
        Return the ITRS position and velocity for a satellite at the time
        specified by the last call to get_gcrs_posvel.

        Returns
        -------
            ITRS position and velocity for satellite
        """
        return self.gcrs.transform_to(ITRS(obstime=self._t))

    def get_gcrs_posvel(
        self, t: Time
    ) -> Tuple[CartesianRepresentation, CartesianRepresentation]:
        """
        Calculate the GCRS (Geocentric Celestial Reference System) position and
        velocity for the satellite at a given time.

        Parameters
        ----------
        t
            The time at which to calculate the position and velocity.

        Returns
        -------
            A tuple containing the GCRS position and velocity as Cartesian coordinates.
        """
        # Calculate GCRS position for Satellite
        self.gcrs = self.get_gcrs(t)
        # Return values expected by get_body
        return (
            self.gcrs.cartesian.without_differentials(),
            self.gcrs.velocity.to_cartesian(),
        )

    def lon(self, t: Time) -> Longitude:
        """
        Returns the longitude of the satellite's location at the given time.

        Parameters
        ----------
        t
            The time at which to calculate the longitude.

        Returns:
            The longitude of the satellite at the given Time.
        """
        return self.get_itrs(t).earth_location.lon

    def lat(self, t: Time) -> Latitude:
        """
        Returns the latitude of the satellite's location at the given time.

        Parameters
        ----------
        t
            The time at which to calculate the Latitude.

        Returns:
            The latitude of the satellite at the given Time.
        """
        return self.get_itrs(t).earth_location.lat


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
    parallax
        Flag indicating whether to include parallax correction.
    earth_radius
        The radius of the Earth in degrees. If not specified (None), it will be
        calculated based on the distance from the Earth to the spacecraft.
    tle
        The TLE (Two-Line Elements) data for the satellite.

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
    stepsize: u.Quantity
    username: str
    parallax: bool
    velocity: bool
    apparent: bool
    earth_radius: Optional[u.Quantity] = None
    tle: Optional[TLEEntry] = None

    def __init__(self, begin: Time, end: Time, stepsize: u.Quantity = 60 * u.s):
        # Check if TLE is loaded
        if self.tle is None:
            raise HTTPException(
                status_code=404, detail="No TLE available for this epoch"
            )

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
        """For a given time, return an index for the nearest time in the
        ephemeris. Note that internally converting from Time to datetime makes
        this run"""
        return int(np.argmin(np.abs((self.timestamp.datetime - t.datetime))))

    @cached_property
    def earth(self) -> SkyCoord:
        """Earth SkyCoord as viewed from spacecraft."""
        return SkyCoord(-self.posvec, frame="gcrs", representation_type="spherical")

    @cached_property
    def beta(self) -> np.ndarray:
        """Return spacecraft beta angle (angle between the plane of the orbit
        and the plane of the Sun)."""
        return np.array(self.pole.separation(self.sun).deg) - 90

    @cached_property
    def ineclipse(self) -> np.ndarray:
        """Is the spacecraft in an Earth eclipse? Defined as when the Sun > 50% behind the Earth"""
        return self.sun.separation(self.earth) < self.earthsize * u.deg

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

        # Set up time array by default include a point for the end value also
        self.timestamp = Time(
            np.arange(self.begin, self.end + self.stepsize, self.stepsize)
        )

        # Set up EarthLocation mimic
        satloc = EarthSatelliteLocation(self.tle.tle1, self.tle.tle2)

        # Calculate satellite position vector as array of x,y,z vectors in
        # units of km, and velocity vector as array of x,y,z vectors in units of km/s
        self.posvec, self.velvec = satloc.get_gcrs_posvel(self.timestamp)

        # Calculate the GCRS position of the Moon in km
        if self.parallax:
            self.moon = get_body("moon", self.timestamp, location=satloc)
        else:
            self.moon = get_body("moon", self.timestamp)

        # Set moonvec to be the position of the Moon in GCRS coordinates
        self.moonvec = self.moon.cartesian

        # Calculate the GCRS position of the Sun in km
        if self.parallax:
            self.sun = get_body("sun", self.timestamp, location=satloc)
        else:
            self.sun = get_body("sun", self.timestamp)

        # Set sunvec to be the position of the Sun in GCRS coordinates
        self.sunvec = self.sun.cartesian

        # Calculate the latitude, longitude and distance from the center of the
        # Earth of the satellite
        self.longitude = satloc.lon(self.timestamp)
        self.latitude = satloc.lat(self.timestamp)
        dist = self.posvec.norm()

        # Calculate the Earth radius in degrees
        if self.earth_radius is not None:
            self.earthsize = self.earth_radius * np.ones(len(self.timestamp))
        else:
            self.earthsize = np.arcsin(EARTH_RADIUS / dist) * u.rad

        # Calculate orbit pole vector
        polevec = self.posvec.cross(self.velvec)
        self.pole = SkyCoord(polevec / polevec.norm())

        return True
