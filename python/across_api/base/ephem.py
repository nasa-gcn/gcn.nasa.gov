# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from functools import cached_property
from typing import Optional

import astropy.units as u  # type: ignore
from astropy.constants import R_earth  # type: ignore
import numpy as np
from astroplan import Observer  # type: ignore
from astropy.coordinates import SkyCoord, get_body  # type: ignore
from astropy.time import Time  # type: ignore
from fastapi import HTTPException

from ..base.schema import EphemGetSchema, EphemSchema, TLEEntry
from ..scheduling.constraints import OrbitNightConstraint
from ..scheduling.orbit import TLE
from .common import ACROSSAPIBase, round_time


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
        The time step size, the default is 60 seconds.

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
    satellite: TLE

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
        return OrbitNightConstraint().compute_constraint(self.timestamp, self.observer)

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

        # Calculate location of satellite for given timestamps
        self.satloc = self.satellite(self.timestamp)

        # Set up astroplan Observer class for spacecraft
        self.observer = Observer(self.satloc.earth_location)

        # Calculate satellite position vector as array of x,y,z vectors in
        # units of km, and velocity vector as array of x,y,z vectors in units of km/s
        self.posvec = self.satloc.gcrs.cartesian.without_differentials()
        self.velvec = self.satloc.gcrs.velocity.to_cartesian()

        # Calculate the position of the Moon relative to the spacecraft
        self.moon = get_body("moon", self.timestamp, location=self.observer.location)

        # Calculate the position of the Moon relative to the spacecraft
        self.sun = get_body("sun", self.timestamp, location=self.observer.location)

        # Calculate the position of the Earth relative to the spacecraft
        self.earth = get_body("earth", self.timestamp, location=self.observer.location)

        # Calculate the latitude, longitude and distance from the center of the
        # Earth of the satellite

        self.longitude = self.observer.latitude
        self.latitude = self.observer.latitude
        dist = self.posvec.norm()

        # Calculate the Earth radius in degrees
        if self.earth_radius is not None:
            self.earthsize = self.earth_radius * np.ones(len(self))
        else:
            self.earthsize = np.arcsin(R_earth / dist)

        # Calculate orbit pole vector
        polevec = self.posvec.cross(self.velvec)
        self.pole = SkyCoord(polevec / polevec.norm())

        return True
