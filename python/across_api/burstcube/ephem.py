# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from cachetools import TTLCache, cached

from ..base.common import ACROSSAPIBase
from ..base.ephem import EphemBase
from .tle import BurstCubeTLE


@cached(cache=TTLCache(maxsize=128, ttl=86400))
class BurstCubeEphem(EphemBase, ACROSSAPIBase):
    """
    Class to generate BurstCube ephemeris. Generate on the fly an ephemeris for
    Satellite from TLE.
    """

    # Configuration options
    velocity = False
    parallax = False  # Calculate parallax for Moon/Sun
    apparent = True  # Use apparent positions
    velocity = False  # Calculate Velocity of spacecraft (slower)
    earth_radius = 70  # Fix 70 degree Earth radius
    tleclass = BurstCubeTLE
