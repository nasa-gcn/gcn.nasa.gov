# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from typing import Optional

import astropy.units as u  # type: ignore
import numpy as np
from astroplan import Observer  # type: ignore
from astropy.constants import R_earth  # type: ignore
from astropy.coordinates import (  # type: ignore
    TEME,
    CartesianDifferential,
    CartesianRepresentation,
    SkyCoord,
    get_body,
)
from astropy.time import Time  # type: ignore
from fastapi import HTTPException
from sgp4.api import Satrec  # type: ignore

from ..base.schema import EphemGetSchema, EphemSchema, TLEEntry
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

        # Round start and end times to stepsize, create array of timestamps
        begin = round_time(self.begin, self.stepsize)
        end = round_time(self.end, self.stepsize)
        steps = (end - begin).to(u.s) / (self.stepsize.to(u.s)) + 1
        self.timestamp = Time(np.linspace(begin, end, steps))

        # Load in the TLE data
        satellite = Satrec.twoline2rv(self.tle.tle1, self.tle.tle2)

        # Calculate TEME position and velocity for Satellite
        _, temes_p, temes_v = satellite.sgp4_array(
            self.timestamp.jd1, self.timestamp.jd2
        )

        # Convert SGP4 TEME data to astropy ITRS SkyCoord
        teme_p = CartesianRepresentation(temes_p.T * u.km)
        teme_v = CartesianDifferential(temes_v.T * u.km / u.s)
        self.itrs = SkyCoord(
            teme_p.with_differentials(teme_v), frame=TEME(obstime=self.timestamp)
        ).itrs

        # Set up astroplan Observer class
        self.observer = Observer(self.itrs.earth_location)

        # Calculate satellite position in GCRS coordinate system vector as
        # array of x,y,z vectors in units of km, and velocity vector as array
        # of x,y,z vectors in units of km/s
        self.posvec, self.velvec = self.observer.location.get_gcrs_posvel(
            self.timestamp
        )

        # Calculate the position of the Moon relative to the spacecraft
        self.moon = get_body("moon", self.timestamp, location=self.observer.location)

        # Calculate the position of the Moon relative to the spacecraft
        self.sun = get_body("sun", self.timestamp, location=self.observer.location)

        # Calculate the position of the Earth relative to the spacecraft
        self.earth = get_body("earth", self.timestamp, location=self.observer.location)

        # Calculate the latitude, longitude and distance from the center of the
        # Earth of the satellite
        self.longitude = self.observer.longitude
        self.latitude = self.observer.latitude
        dist = self.posvec.norm()

        # Calculate the Earth radius in degrees
        if self.earth_radius is not None:
            self.earthsize = self.earth_radius * np.ones(len(self))
        else:
            self.earthsize = np.arcsin(R_earth / dist)

        return True
