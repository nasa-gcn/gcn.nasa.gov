# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from astropy.time import Time  # type: ignore
from cachetools import TTLCache, cached

from ..base.tle import TLEBase


@cached(cache=TTLCache(maxsize=128, ttl=3600))
class SwiftTLE(TLEBase):
    # Configuration options for SwiftTLE
    tle_name = "SWIFT"
    tle_url = "https://celestrak.org/NORAD/elements/gp.php?INTDES=2004-047"
    tle_concat = "https://www.swift.ac.uk/about/status_files/tle"
    tle_bad = 4
    tle_min_epoch = Time("2004-11-20 23:00:00", scale="utc")
