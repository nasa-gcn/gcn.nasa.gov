from datetime import datetime

from cachetools import TTLCache, cached

from ..base.tle import TLEBase


@cached(cache=TTLCache(maxsize=128, ttl=3600))
class BurstCubeTLE(TLEBase):
    """
    Class for retrieving BurstCube TLEs from the TLE database. If the TLEs are not
    found in the database, they are retrieved from either the supplied `tle_url`,
    or from the URL specified in the `tle_heasarc` attribute (in the HEASARC
    concatenated TLE format), then written to the database.

    Parameters
    ----------
    epoch
        Epoch of BurstCubeTLE to retrieve

    Attributes
    ----------
    tles
        List of BurstCubeTLEs for given epoch
    tle
        BurstCubeTLE entry for given epoch
    tle_name
        Name of the spacecraft as it appears in the TLE
    tle_url
        URL to retrieve the TLE from
    tle_heasarc
        URL to retrieve the TLE from in HEASARC format
    tle_bad
        If the TLE is this many days old, it is considered outdated,
        and a new TLE will be retrieved
    tle_min_epoch
        Minimum epoch for which TLEs are available, typically this will
        correspond to a date after the launch of the spacecraft

    Methods
    -------
    get
        Get BurstCubeTLEs for given epoch

    """

    # Configuration options for BurstCubeTLE (FIXME: Placeholder pre-launch)
    tle_name = "ISS (ZARYA)"
    tle_url = "https://celestrak.com/NORAD/elements/stations.txt"
    tle_heasarc = None
    tle_bad = 40
    tle_min_epoch = datetime(2023, 12, 18)

    def __init__(self, epoch: datetime):
        self.epoch = epoch
        self.tles = []
        if self.validate_get():
            self.get()
