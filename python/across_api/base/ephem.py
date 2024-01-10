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
    Latitude,
    Longitude,
    SkyCoord,
    get_body,
)
from astropy.time import Time  # type: ignore
from fastapi import HTTPException
from sgp4.api import Satrec  # type: ignore

from ..base.schema import EphemGetSchema, EphemSchema, TLEEntry
from .common import ACROSSAPIBase, round_time

# Constants
EARTH_RADIUS = 6371 * u.km  # km. Note this is average radius, as Earth is not a sphere.


class EarthSatelliteLocation:
    """
    Class to calculate the position of a satellite in orbit around the Earth.
    The default parameter for this class is a True Equator Mean Equinox (TEME)
    coordinate with positiona and velocity, and a given obstime. `obstime`
    should be an array like `Time` object, covering the period of interest.

    The `from_tle` classmethod can be used to create an instance of this class
    from a TLE (Two-Line Element) file. This uses the `sgp4` package to
    calculate the position of the satellite in TEME coordinates, and returns an
    instantiated `EarthSatelliteLocation` object.

    Note this mimics the `astropy.coordinates` `EarthLocation` class, in that
    it provides the method `get_gcrs_posvel` which returns the position and
    velocity of the satellite in GCRS coordinates. Therefore this class can be
    used by the astropy `get_body` function to set the location of the observer
    to a Earth orbiting satellite, in place of an `EarthLocation` object (which
    defines a ground based observatory).

    This way you can calculate the RA/Dec of the Earth, Moon and Sun as viewed
    from the satellite, including the effects of the satellite's motion on the
    position of these objects in the sky.

    This class also provides attributes for the latitude and longitude of the
    spacecraft over the Earth, used for (e.g.) determining if the spacecraft is
    in the South Atlantic Anomaly (SAA). This is done by calculating the
    International Terrestrial Reference System (ITRS) position of the
    spacecraft, and then converting this to latitude and longitude using the
    `earth_location` method of the `ITRS` class.

    Parameters
    ----------
    teme
        The TEME position and velocity of the satellite.

    Attributes
    ----------
    t
        The time at which the satellite position was calculated.
    gcrs
        The GCRS position and velocity of the satellite.
    itrs
        The ITRS position and velocity of the satellite.
    lon
        The longitude of the satellite.
    lat
        The latitude of the satellite.

    Methods
    -------
    get_gcrs_posvel
        Calculate the GCRS position and velocity of the satellite at a given
        time. Note the time must match the time used to instantiate the class.
    """

    # Type hints
    teme: TEME

    def __init__(self, teme: TEME):
        self.teme = teme

    @classmethod
    def from_tle(cls, tle: TLEEntry, obstime: Time) -> "EarthSatelliteLocation":
        """
        Returns a EarthSatelliteLocation object for a given TLE and time. This
        calculates the TEME position and velocity for a satellite, derived from
        the TLE, using the `sgp4` package.

        Parameters
        ----------
        obstime
            Time to calculate position for. Must be array-type.

        Returns
        -------
            A EarthSatelliteLocation object for the given TLE and time.
        """
        # Load in the TLE data
        satellite = Satrec.twoline2rv(tle.tle1, tle.tle2)

        # Calculate TEME position and velocity for Satellite
        _, temes_p, temes_v = satellite.sgp4_array(obstime.jd1, obstime.jd2)

        # Convert SGP4 TEME data to astropy TEME data
        teme_p = CartesianRepresentation(temes_p.T * u.km)
        teme_v = CartesianDifferential(temes_v.T * u.km / u.s)
        teme = TEME(teme_p.with_differentials(teme_v), obstime=obstime)

        # Return class with TEME loaded
        return cls(teme)

    @cached_property
    def gcrs(self) -> GCRS:
        """
        Return the GCRS position and velocity for a satellite

        Returns
        -------
            GCRS position and velocity for satellite
        """

        # Transform to TEME to GCRS
        return self.teme.transform_to(GCRS(obstime=self.teme.obstime))

    @cached_property
    def itrs(self) -> ITRS:
        """
        Return the ITRS position and velocity for a satellite

        Returns
        -------
            ITRS position and velocity for satellite
        """
        return self.gcrs.transform_to(ITRS(obstime=self.gcrs.obstime))

    def get_gcrs_posvel(
        self, t: Time
    ) -> Tuple[CartesianRepresentation, CartesianRepresentation]:
        """
        Return the GCRS (Geocentric Celestial Reference System) position and
        velocity for the satellite at a given time. Note that the time t has to
        match the time used to instantiate the class.

        Parameters
        ----------
        t
            The time at which to calculate the position and velocity.

        Returns
        -------
            A tuple containing the GCRS position and velocity as Cartesian coordinates.
        """
        # Check if t matches obstime
        if t is not self.teme.obstime:
            raise ValueError(
                "Supplied Time does not match obstime of TEME position/velocity of satellite."
            )

        # Return values expected by get_body
        return (
            self.gcrs.cartesian.without_differentials(),
            self.gcrs.velocity.to_cartesian(),
        )

    @cached_property
    def lon(self) -> Longitude:
        """
        Returns the longitude of the satellite's location.

        Returns:
            The longitude of the satellite.
        """
        return self.itrs.earth_location.lon

    @cached_property
    def lat(self) -> Latitude:
        """
        Returns the latitude of the satellite's location.

        Returns:
            The latitude of the satellite.
        """
        return self.itrs.earth_location.lat


class EphemBase(ACROSSAPIBase):
    """
    Base class for computing ephemeris data, for spacecraft whose positions can
    be determined using a Two-Line Element (TLE), i.e. most Earth-orbiting
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
    earth_radius
        The radius of the Earth in degrees. If not specified (None), it will be
        calculated based on the distance from the Earth to the spacecraft.
    tle
        The TLE (Two-Line Element) data for the satellite.

    Methods
    -------
    ephindex
        Returns the array index for a given time.
    get
        Computes the ephemeris for the specified time range.
    """

    _schema = EphemSchema
    _get_schema = EphemGetSchema

    # Type hints
    begin: Time
    end: Time
    stepsize: u.Quantity
    earth_radius: Optional[u.Quantity] = None
    tle: Optional[TLEEntry] = None

    def __init__(self, begin: Time, end: Time, stepsize: u.Quantity = 60 * u.s):
        # Check if TLE is loaded
        if self.tle is None:
            raise HTTPException(
                status_code=404, detail="No TLE available for this epoch"
            )

        # Parse inputs, round begin and end to stepsize
        self.begin = round_time(begin, stepsize)
        self.end = round_time(end, stepsize)
        self.stepsize = stepsize

        # Validate and process API call
        if self.validate_get():
            # Perform GET
            self.get()

    def __len__(self) -> int:
        return len(self.timestamp)

    def ephindex(self, t: Time) -> int:
        """
        For a given time, return an index for the nearest time in the
        ephemeris. Note that internally converting from Time to datetime makes
        this run way faster.

        Parameters
        ----------
        t
            The time to find the nearest index for.

        Returns
        -------
            The index of the nearest time in the ephemeris.
        """
        return int(np.argmin(np.abs((self.timestamp.datetime - t.datetime))))

    @cached_property
    def beta(self) -> np.ndarray:
        """
        Return spacecraft beta angle (angle between the plane of the orbit
        and the plane of the Sun).

        Returns
        -------
            The beta angle of the spacecraft.
        """
        return self.pole.separation(self.sun) - 90 * u.deg

    @cached_property
    def ineclipse(self) -> np.ndarray:
        """
        Is the spacecraft in an Earth eclipse? Defined as when the Sun > 50%
        behind the Earth.

        Returns
        -------
            A boolean array indicating if the spacecraft is in eclipse.
        """
        return self.earth.separation(self.sun) < self.earthsize

    def get(self) -> bool:
        """
        Compute the ephemeris for the specified time range with at a
        time resolution given by self.stepsize.

        Note only calculates Spacecraft position, velocity,
        Sun/Moon position and latitude/longitude of the spacecraft
        initially.

        Returns
        -------
            True if successful, False if not.
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
        satloc = EarthSatelliteLocation.from_tle(self.tle, obstime=self.timestamp)

        # Calculate satellite position vector as array of x,y,z vectors in
        # units of km, and velocity vector as array of x,y,z vectors in units of km/s
        self.posvec, self.velvec = satloc.get_gcrs_posvel(self.timestamp)

        # Calculate the position of the Moon relative to the spacecraft
        self.moon = get_body("moon", self.timestamp, location=satloc)

        # Calculate the position of the Moon relative to the spacecraft
        self.sun = get_body("sun", self.timestamp, location=satloc)

        # Calculate the position of the Earth relative to the spacecraft
        self.earth = get_body("earth", self.timestamp, location=satloc)

        # Calculate the latitude, longitude and distance from the center of the
        # Earth of the satellite
        self.longitude = satloc.lon
        self.latitude = satloc.lat
        dist = self.posvec.norm()

        # Calculate the Earth radius in degrees
        if self.earth_radius is not None:
            self.earthsize = self.earth_radius * np.ones(len(self))
        else:
            self.earthsize = np.arcsin(EARTH_RADIUS / dist)

        # Calculate orbit pole vector
        polevec = self.posvec.cross(self.velvec)
        self.pole = SkyCoord(polevec / polevec.norm())

        return True
