# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from typing import Union

import astropy.units as u  # type: ignore[import]
import numpy as np
from astropy.coordinates import Angle, SkyCoord  # type: ignore[import]
from astropy.time import Time  # type: ignore[import]
from shapely import Polygon, points  # type: ignore[import]

from .ephem import EphemBase


def get_slice(time: Time, ephem: EphemBase) -> slice:
    """
    Return a slice for what the part of the ephemeris that we're using.

    Arguments
    ---------
    time
        The time to calculate the slice for
    ephem
        The spacecraft ephemeris

    Returns
    -------
        The slice for the ephemeris
    """
    # If we're just passing a single time, we can just find the index for that
    if time.isscalar:
        # Find the index for the time and return a slice for that index
        index = ephem.ephindex(time)
        return slice(index, index + 1)
    else:
        # Find the indices for the start and end of the time range and return a
        # slice for that range
        return slice(ephem.ephindex(time[0]), ephem.ephindex(time[-1]) + 1)


class SAAPolygonConstraint:
    """
    Polygon based SAA constraint. The SAA is defined by a Shapely Polygon, and
    this constraint will calculate for a given set of times and a given
    ephemeris whether the spacecraft is in that SAA polygon.

    Attributes
    ----------
    polygon
        Shapely Polygon object defining the SAA polygon.
    """

    polygon: Polygon

    def __init__(self, polygon: list):
        self.polygon = Polygon(polygon)

    def __call__(self, time: Time, ephem: EphemBase) -> Union[bool, np.ndarray]:
        """
        Return a bool array indicating whether the spacecraft is in constraint
        for a given ephemeris.

        Arguments
        ---------
        time
            The time(s) to calculate the constraint for.
        ephem
            The spacecraft ephemeris, must be precalculated. NOTE: The
            ephemeris can be calculated for a longer time range than the `time`
            argument, but it must contain the time(s) in the `time` argument.

        Returns
        -------
            Array of booleans for every value in `time` returning True if the
            spacecraft is in the SAA polygon at that time. If `time` is a
            scalar then a single boolean is returned.
        """

        # Find a slice what the part of the ephemeris that we're using
        i = get_slice(time, ephem)

        in_constraint = self.polygon.contains(
            points(ephem.longitude[i], ephem.latitude[i])
        )
        # Return the result as True or False, or an array of True/False
        return in_constraint[0] if time.isscalar else in_constraint


class EarthLimbConstraint:
    """
    For a given Earth limb avoidance angle, is a given coordinate inside this
    constraint?

    Parameters
    ----------
    min_angle
        The minimum angle from the Earth limb that the spacecraft can point.

    Methods
    -------
    __call__(coord, ephem, earthsize=None)
        Checks if a given coordinate is inside the constraint.

    """

    min_angle: u.Quantity

    def __init__(self, min_angle: u.Quantity):
        self.min_angle = Angle(min_angle)

    def __call__(
        self,
        time: Time,
        ephem: EphemBase,
        skycoord: SkyCoord,
    ) -> Union[bool, np.ndarray]:
        """
        Check for a given time, ephemeris and coordinate if positions given are
        inside the Earth limb constraint. This is done by checking if the
        separation between the Earth and the spacecraft is less than the
        Earth's angular radius plus the minimum angle.

        NOTE: Assumes a circular approximation for Earth.

        Parameters
        ----------
        coord
            The coordinate to check.
        time
            The time to check.
        ephem
            The ephemeris object.

        Returns
        -------
        bool
            `True` if the coordinate is inside the constraint, `False`
            otherwise.

        """
        # Find a slice what the part of the ephemeris that we're using
        i = get_slice(time, ephem)

        # Calculate the angular distance between the center of the Earth and
        # the object. Note that creating the SkyCoord here from ra/dec stored
        # in the ephemeris `earth` is 3x faster than just doing the separation
        # directly with `earth`.
        in_constraint = (
            SkyCoord(ephem.earth[i].ra, ephem.earth[i].dec).separation(skycoord)
            < ephem.earthsize[i] + self.min_angle
        )

        # Return the result as True or False, or an array of True/False
        return (
            in_constraint[0] if time.isscalar and skycoord.isscalar else in_constraint
        )
