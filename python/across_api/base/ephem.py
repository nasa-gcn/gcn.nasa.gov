# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from datetime import timedelta
from typing import Optional

import astropy.units as u  # type: ignore
import numpy as np
from astropy.constants import R_earth  # type: ignore
from astropy.coordinates import (  # type: ignore
    GCRS,
    TEME,
    CartesianDifferential,
    CartesianRepresentation,
    SkyCoord,
    get_body,
)
from astropy.time import Time  # type: ignore
from fastapi import HTTPException
from sgp4.api import Satrec  # type: ignore

from ..base.schema import TLEEntry
from .common import round_time


class EphemBase:
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
    """

    # Type hints
    begin: Time
    end: Time
    stepsize: u.Quantity
    earth_radius: Optional[u.Quantity] = None
    tle: Optional[TLEEntry] = None

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
        index = np.round(
            (t.jd - self.timestamp[0].jd) // self.stepsize.to_value(u.day)
        ).astype(int)
        assert index >= 0 and index < len(self), "Time outside of ephemeris of range"
        return index

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

        # Check the TLE is available
        if self.tle is None:
            raise HTTPException(
                status_code=404, detail="No TLE available for this epoch"
            )

        # Create array of timestamps
        if self.begin == self.end:
            self.timestamp = Time([self.begin])
        else:
            step = timedelta(seconds=self.stepsize.to_value(u.s))
            self.timestamp = Time(
                np.arange(self.begin.datetime, self.end.datetime + step, step)
            )

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

        # Calculate satellite position in GCRS coordinate system vector as
        # array of x,y,z vectors in units of km, and velocity vector as array
        # of x,y,z vectors in units of km/s
        self.gcrs = self.itrs.transform_to(GCRS)
        self.posvec = self.gcrs.cartesian.without_differentials()
        self.velvec = self.gcrs.velocity.to_cartesian()

        # Calculate the position of the Moon relative to the spacecraft
        self.moon = get_body("moon", self.timestamp, location=self.itrs.earth_location)

        # Calculate the position of the Moon relative to the spacecraft
        self.sun = get_body("sun", self.timestamp, location=self.itrs.earth_location)

        # Calculate the position of the Earth relative to the spacecraft
        self.earth = get_body(
            "earth", self.timestamp, location=self.itrs.earth_location
        )

        # Calculate the latitude, longitude and distance from the center of the
        # Earth of the satellite
        self.longitude = self.itrs.earth_location.lon
        self.latitude = self.itrs.earth_location.lat
        dist = self.posvec.norm()

        # Calculate the Earth radius in degrees
        if self.earth_radius is not None:
            self.earthsize = self.earth_radius * np.ones(len(self))
        else:
            self.earthsize = np.arcsin(R_earth / dist)
