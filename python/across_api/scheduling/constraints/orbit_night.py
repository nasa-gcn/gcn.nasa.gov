#
# Copyright © 2021 United States Government as represented by the Administrator
# of the National Aeronautics and Space Administration. No copyright is claimed
# in the United States under Title 17, U.S. Code. All Other Rights Reserved.
#
# SPDX-License-Identifier: NASA-1.3
#
from astropy.coordinates import get_sun  # type: ignore
from astropy import units as u  # type: ignore
import numpy as np

from .earth_limb import EarthLimbConstraint

__all__ = ("OrbitNightConstraint",)


class OrbitNightConstraint(EarthLimbConstraint):
    """
    Constrain the angle of the Sun from the Earth limb.

    Parameters
    ----------
    min : :class:`astropy.units.Quantity`
        Minimum angle of the edge of the sun's disc from the Earth's limb.

    Notes
    -----
    This constraint assumes a spherical Earth, so it is only accurate to about
    a degree for observers in very low Earth orbit (height of 100 km).
    """

    def __init__(self, min=0 * u.deg):
        self.min = min - 1 * u.R_sun / u.au * u.rad

    def compute_constraint(self, times, observer, targets=None):
        return np.logical_not(
            super().compute_constraint(times, observer, get_sun(times))
        )
