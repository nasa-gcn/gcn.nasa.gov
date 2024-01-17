# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

import astropy.units as u  # type: ignore
from astropy.time import Time  # type: ignore
from cachetools import TTLCache, cached

from ..base.common import ACROSSAPIBase
from ..base.ephem import EphemBase
from ..burstcube.tle import BurstCubeTLE


@cached(cache=TTLCache(maxsize=128, ttl=86400))
class BurstCubeEphem(EphemBase, ACROSSAPIBase):
    """
    Class to generate BurstCube ephemeris. Generate on the fly an ephemeris for
    Satellite from TLE.
    """

    # Configuration options
    earth_radius = 70 * u.deg  # Fix 70 degree Earth radius

    def __init__(self, begin: Time, end: Time, stepsize: u.Quantity = 60 * u.s):
        self.tle = BurstCubeTLE(begin).tle
        if self.tle is not None:
            super().__init__(begin=begin, end=end, stepsize=stepsize)
