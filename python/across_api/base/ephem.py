from datetime import datetime, timedelta
from typing import List, Optional

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

from ..across.jobs import check_cache, register_job
from .common import ACROSSAPIBase
from .schema import EphemGetSchema, EphemSchema, JobInfo
from .tle import TLEEntry

# Constants
EARTH_RADIUS = 6371  # km. Note this is average radius, as Earth is not a sphere.


class EphemBase(ACROSSAPIBase):
    """Base class for Ephemeris API."""

    _schema = EphemSchema
    _get_schema = EphemGetSchema
    _cache_time = (
        86400 * 7
    )  # Cache Ephemeris for a week, because it really never goes out of date
    # Type hints
    begin: datetime
    end: datetime
    stepsize: int
    # ap_times: Time
    status: JobInfo
    username: str
    parallax: bool
    velocity: bool
    apparent: bool
    tle: Optional[TLEEntry]

    def __init__(self) -> None:
        # Internal values
        self._beta: np.ndarray
        self._ineclipse: np.ndarray
        self._posvec: np.ndarray
        self._polevec: Optional[np.ndarray] = None
        self._pole: SkyCoord
        self._sun: SkyCoord
        self._moon: SkyCoord
        self._ap_times: Time
        self._velvec: np.ndarray
        self._latitude: np.ndarray
        self._longitude: np.ndarray
        self._earthsize: np.ndarray
        self._earth: SkyCoord
        self._timestamp: List[datetime]
        self.datetimes: List[datetime]

        # Attributes
        self.status = JobInfo()

    def __len__(self) -> int:
        return len(self.timestamp)

    def ephindex(self, dt: datetime) -> int:
        """For a given time, return a time index that is valid for this ephemeris (rounded up)"""
        return round((dt - self.timestamp[0]).total_seconds() / self.stepsize)

    # These ensure that lists get converted back to np.ndarrays
    @property
    def posvec(self) -> np.ndarray:
        return self._posvec

    @posvec.setter
    def posvec(self, vec):
        self._posvec = np.array(vec)

    # These ensure that lists get converted back to np.ndarrays
    @property
    def velvec(self) -> Optional[np.ndarray]:
        if hasattr(self, "_velvec") is False:
            return None
        return self._velvec

    @velvec.setter
    def velvec(self, vec: np.ndarray):
        if type(vec) is list:
            vec = np.array(vec)
        self._velvec = vec

    # These ensure that lists get converted back to np.ndarrays
    @property
    def polevec(self) -> Optional[np.ndarray]:
        return self._polevec

    @polevec.setter
    def polevec(self, vec):
        if vec is not None:
            self._polevec = np.array(vec)

    @property
    def pole(self):
        if self._polevec is not None and hasattr(self, "_pole") is False:
            self._pole = SkyCoord(
                CartesianRepresentation(x=self._polevec.T),
                # frame=GCRS(obstime=self.ap_times),
            )
        return self._pole

    @property
    def sunvec(self):
        return self._sunvec

    @sunvec.setter
    def sunvec(self, vec):
        self._sunvec = np.array(vec)

    @property
    def moonvec(self):
        return self._moonvec

    @moonvec.setter
    def moonvec(self, vec):
        self._moonvec = np.array(vec)

    @property
    def earthsize(self):
        if self.config.ephem.earth_radius is not None:
            return self.config.ephem.earth_radius * np.ones(len(self))
        return self._earthsize

    @earthsize.setter
    def earthsize(self, es):
        self._earthsize = np.array(es)

    @property
    def latitude(self):
        return self._latitude

    @latitude.setter
    def latitude(self, vec):
        self._latitude = np.array(vec)

    @property
    def longitude(self):
        return self._longitude

    @longitude.setter
    def longitude(self, vec):
        self._longitude = np.array(vec)

    # Derived properties
    @property
    def ap_times(self) -> Time:
        """Astropy Time array for the ephemeris"""
        if not hasattr(self, "_ap_times"):
            self._ap_times = Time(self.timestamp, format="datetime", scale="utc")
        return self._ap_times

    @property
    def earth(self) -> SkyCoord:
        """Earth RA/Dec"""
        if hasattr(self, "_earth") is False:
            self._earth = SkyCoord(
                CartesianRepresentation(x=-self.posvec.T),
                # frame=GCRS(obstime=self.ap_times),
            )
        return self._earth

    @property
    def earth_ra(self) -> np.ndarray:
        return self.earth.ra.deg

    @property
    def earth_dec(self) -> np.ndarray:
        return self.earth.dec.deg

    @property
    def sun_ra(self) -> np.ndarray:
        return self.sun.ra.deg

    @property
    def sun_dec(self) -> np.ndarray:
        return self.sun.dec.deg

    @property
    def moon_ra(self) -> np.ndarray:
        return self.moon.ra.deg

    @property
    def moon_dec(self) -> np.ndarray:
        return self.moon.dec.deg

    @property
    def tle_epoch(self) -> Optional[datetime]:
        if self.tle is not None:
            return self.tle.epoch
        return None

    @property
    def beta(self) -> np.ndarray:
        """Return beta angle"""
        if hasattr(self, "_beta") is False:
            self._beta = np.array(self.pole.separation(self.sun).deg) - 90
        return self._beta

    @property
    def sun(self) -> SkyCoord:
        """Calculate Sun RA/Dec"""
        if hasattr(self, "_sun") is False:
            if self.parallax:
                self._sun = SkyCoord(
                    CartesianRepresentation(
                        x=self.sunvec.T - self.posvec.T,
                    ),
                    # frame=GCRS(obstime=self.ap_times),
                )
            else:
                self._sun = SkyCoord(
                    CartesianRepresentation(x=self.sunvec.T),
                    # frame=GCRS(obstime=self.ap_times),
                )
        return self._sun

    @property
    def ineclipse(self) -> np.ndarray:
        """Is the spacecraft in an Earth eclipse? Defined as when the Sun > 50% behind the Earth"""
        return self.sun.separation(self.earth) < self.earthsize * u.deg

    @property
    def moon(self) -> SkyCoord:
        """Calculate moon RA/Dec and vector"""
        if hasattr(self, "_moon") is False:
            if self.parallax:
                # Calculate the position of the Moon from the spacecraft, not the center of the Earth
                self._moon = SkyCoord(
                    CartesianRepresentation(x=self.moonvec.T - self.posvec.T),
                    # frame=GCRS(obstime=self.ap_times),
                )
            else:
                # Calculate the position of the Moon from the center of the Earth
                self._moon = SkyCoord(
                    CartesianRepresentation(x=self.moonvec.T),
                    # frame=GCRS(obstime=self.ap_times),
                )
        return self._moon

    def compute(self) -> bool:
        """Compute the ephemeris for the specified time range with at a
        time resolution given by self.stepsize.

        Note only calculates Spacecraft position, velocity (optionally),
        Sun/Moon position and latitude/longitude of the spacecraft
        initially. These are stored as arrays of vectors as
        a 2xN or 3xN array of floats, in units of degrees (Lat/Lon) or km
        (position) and km/s (velocity).

        These are stored as floats to allow easy serialization into JSON,
        download and caching. Derived values are calculated on the fly.
        """

        # Set up the time stuff
        dtstart = self.begin
        dtstart = dtstart

        # Check the TLE is loaded
        if self.tle is None:
            raise HTTPException(
                status_code=404, detail="No TLE available for this epoch"
            )

        # Load the TLE
        self.satellite = Satrec.twoline2rv(self.tle.tle1, self.tle.tle2)

        # Loop to create the ephemeris values for every time step
        entries = int((self.end - self.begin).total_seconds() / self.stepsize + 1)

        # Set up time arrays
        self.timestamp = [
            dtstart + timedelta(seconds=t * self.stepsize) for t in range(entries)
        ]

        # Calculate GCRS position for Satellite
        _, temes_p, temes_v = self.satellite.sgp4_array(
            self.ap_times.jd1, self.ap_times.jd2
        )
        teme_p = CartesianRepresentation(temes_p.T * u.km)
        if self.velocity is True:
            # Calculate position with differentials, so satellite velocity can be determined
            teme_v = CartesianDifferential(temes_v.T * u.km / u.s)
            teme = TEME(teme_p.with_differentials(teme_v), obstime=self.ap_times)
        else:
            # Just calculate satellite positions (~5x faster)
            teme = TEME(teme_p.without_differentials(), obstime=self.ap_times)
        self.gcrs = teme.transform_to(GCRS(obstime=self.ap_times))

        # Calculate posvec
        self.posvec = self.gcrs.cartesian.xyz.to(u.km).value.T

        # Moonvec
        moon = get_body("moon", self.ap_times)

        # Use apparent position of the Moon?
        if self.apparent:
            moon = moon.tete
        self.moonvec = moon.cartesian.xyz.to(u.km).value.T

        # Sunvec
        sun = get_body("sun", self.ap_times)

        # Use apparent position of the Moon?
        if self.apparent:
            sun = sun.tete
        self.sunvec = sun.cartesian.xyz.to(u.km).value.T

        # Calculate Latitude/Longitude of spacecraft over Earth
        # This method calculates the alt/az of the spacecraft as viewed
        # from the center of the Earth. This matches lat/long well enough
        # for the purpose we need it: Determining if we're in the SAA.
        # Accurate to within ~5 arcminutes in latitude and 0.25 arcminutes
        # in longitude (latitude variance due to Earth not being spherical)
        # FIXME: Proper calculation of Lat/Lon of point below spacecraft using WGS84
        earth_centered_frame = AltAz(
            obstime=self.ap_times,
            location=EarthLocation.from_geocentric(0, 0, 0, unit="m"),
        )
        lon_lat_dist = SkyCoord(self.gcrs).transform_to(earth_centered_frame).spherical
        self.longitude = 180 - lon_lat_dist.lon.deg
        self.latitude = lon_lat_dist.lat.deg

        # Calculate Angular size of Earth in degrees, note assumes Earth is spherical
        earth_distance = lon_lat_dist.distance.to(u.km).value
        self.earthsize = np.degrees(np.arcsin(EARTH_RADIUS / earth_distance))

        # Calculate velocity components, if we want them
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

    @check_cache
    @register_job
    def get(self) -> bool:
        # Check if all parameters are valid
        if self.validate_get():
            # Compute Ephemeris
            self.compute()
            return True
        else:
            return False
