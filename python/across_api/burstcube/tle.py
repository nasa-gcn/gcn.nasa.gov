# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

import astropy.units as u  # type: ignore
from astropy.time import Time  # type: ignore
from cachetools import TTLCache, cached

from ..base.tle import TLEBase


@cached(cache=TTLCache(maxsize=128, ttl=3600))
class BurstCubeTLE(TLEBase):
    # Configuration options for BurstCubeTLE
    # FIXME: These values are placeholders until BurstCube is launched
    tle_name = "ISS (ZARYA)"
    tle_url = "https://celestrak.com/NORAD/elements/stations.txt"
    tle_concat = None
    tle_bad = 4 * u.day
    tle_min_epoch = Time("2023-12-18", scale="utc")
