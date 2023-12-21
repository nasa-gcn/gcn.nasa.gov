from datetime import datetime

from cachetools import TTLCache, cached

from ..base.tle import TLEBase


@cached(cache=TTLCache(maxsize=128, ttl=3600))
class BurstCubeTLE(TLEBase):
    """
    Class that reads and updates BurstCubeTLEs for a given Satellite in a database,
    and returns a skyfield EarthSatellite based on BurstCubeTLE file for the correct epoch.


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

    Methods
    -------
    get
        Get BurstCubeTLEs for given epoch

    """

    # Configuration options for BurstCubeTLE
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
