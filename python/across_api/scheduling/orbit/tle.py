#
# Copyright © 2021 United States Government as represented by the Administrator
# of the National Aeronautics and Space Administration. No copyright is claimed
# in the United States under Title 17, U.S. Code. All Other Rights Reserved.
#
# SPDX-License-Identifier: NASA-1.3
#
from astropy.coordinates import SkyCoord, TEME  # type: ignore
from astropy import units as u  # type: ignore
from astropy.utils.data import get_readable_fileobj  # type: ignore
import numpy as np
from sgp4.api import Satrec, SGP4_ERRORS  # type: ignore

from .base import Orbit


class TLE(Orbit):
    """An Earth satellite whose orbit is specified by its TLE.

    Parameters
    ----------
    tle : str, file
        The filename or file-like object containing the two-line element (TLE).

    Examples
    --------

    Load an example TLE from a file:

    >>> from importlib import resources
    >>> from astropy.time import Time
    >>> from astropy import units as u
    >>> from dorado.scheduling.orbit import TLE
    >>> from astropy.utils.data import get_pkg_data_filename
    >>> with resources.path('dorado.scheduling.data',
    ...                     'dorado-625km-sunsync.tle') as path:
    ...     orbit = TLE(path)

    Get the orbital period:

    >>> orbit.period
    <Quantity 97.20725153 min>

    Evaluate the position and velocity of the satellite at one specific time:

    >>> time = Time('2021-04-16 15:27')
    >>> orbit(time)
    <SkyCoord (ITRS: obstime=2021-04-16 15:27:00.000, location=(0., 0., 0.) km): (x, y, z) in km
        (3902.59787475, -5209.69979179, 2582.6992906)
     (v_x, v_y, v_z) in km / s
        (-2.92827146, 1.25697376, 6.93396917)>

    Or evaluate at an array of times:

    >>> times = time + np.linspace(0 * u.min, 2 * u.min, 50)
    >>> orbit(times).shape
    (50,)

    """  # noqa: E501

    def __init__(self, tle):
        with get_readable_fileobj(tle) as f:
            *_, line1, line2 = f.readlines()
        self._tle = Satrec.twoline2rv(line1, line2)

    @property
    def period(self):
        """The orbital period at the epoch of the TLE."""
        return 2 * np.pi / self._tle.no * u.minute

    def __call__(self, time):
        """Get the position and velocity of the satellite.

        Parameters
        ----------
        time : :class:`astropy.time.Time`
            The time of the observation.

        Returns
        -------
        coord : :class:`astropy.coordinates.SkyCoord`
            The coordinates of the satellite in the ITRS frame.

        Notes
        -----
        The orbit propagation is based on the example code at
        https://docs.astropy.org/en/stable/coordinates/satellites.html.

        """
        shape = time.shape
        time = time.ravel()

        time = time.utc
        e, xyz, vxyz = self._tle.sgp4_array(time.jd1, time.jd2)
        x, y, z = xyz.T
        vx, vy, vz = vxyz.T

        # If any errors occurred, only raise for the first error
        e = e[e != 0]
        if e.size > 0:
            raise RuntimeError(SGP4_ERRORS[e[0]])

        coord = SkyCoord(
            x=x * u.km,
            v_x=vx * u.km / u.s,
            y=y * u.km,
            v_y=vy * u.km / u.s,
            z=z * u.km,
            v_z=vz * u.km / u.s,
            frame=TEME(obstime=time),
        ).itrs
        if shape:
            coord = coord.reshape(shape)
        else:
            coord = coord[0]
        return coord
