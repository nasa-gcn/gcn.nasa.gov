# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from astropy.time import Time  # type: ignore
from cachetools import TTLCache, cached

from ..base.tle import TLEBase


@cached(cache=TTLCache(maxsize=128, ttl=3600))
class SwiftTLE(TLEBase):
    """
    Class for retrieving Swift TLEs from the TLE database. If the TLEs are
    not found in the database, they are retrieved from either the supplied
    `tle_url`, or from the URL specified in the `tle_concat` attribute (in the
    concatenated TLE format), then written to the database.

    Attributes
    ----------
    tle_name
        Name of the spacecraft as it appears in the Spacecraft Catalog.
    tle_url
        URL to retrieve the TLE from.
    tle_concat
        URL to retrieve the TLE from in concatenated format.
    tle_bad
        If the TLE is this many days old, it is considered outdated, and a new
        TLE will be retrieved.
    tle_min_epoch
        Minimum epoch for which TLEs are available, typically this will
        correspond to a date after the launch of the spacecraft.
    """

    # Configuration options for SwiftTLE
    tle_name = "SWIFT"
    tle_url = "https://celestrak.org/NORAD/elements/gp.php?INTDES=2004-047"
    tle_concat = "https://www.swift.ac.uk/about/status_files/tle"
    tle_bad = 4
    tle_min_epoch = Time("2004-11-20 23:00:00", scale="utc")
