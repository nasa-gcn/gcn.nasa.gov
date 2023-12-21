from datetime import datetime
from cachetools import cached, TTLCache

from ..base.config import set_observatory
from ..base.tle import TLEBase
from .config import BURSTCUBE


@cached(cache=TTLCache(maxsize=128, ttl=3600))
@set_observatory(BURSTCUBE)
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

    def __init__(self, epoch: datetime):
        self.epoch = epoch
        self.tles = []
