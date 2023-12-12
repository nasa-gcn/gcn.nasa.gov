from datetime import datetime

from ..base.config import set_observatory
from ..base.tle import TLEBase
from .config import BURSTCUBE
from .models import BurstCubeTLEEntryModel


@set_observatory(BURSTCUBE)
class BurstCubeTLE(TLEBase):
    """
    Class that reads and updates BurstCubeTLEs for a given Satellite in a database,
    and returns a skyfield EarthSatellite based on BurstCubeTLE file for the correct epoch.


    Parameters
    ----------
    epoch : datetime
        Epoch of BurstCubeTLE to retrieve

    Attributes
    ----------
    tles : list
        List of BurstCubeTLEs for given epoch
    tle : BurstCubeTLEEntryModel
        BurstCubeTLE entry for given epoch

    Methods
    -------
    get
        Get BurstCubeTLEs for given epoch

    """

    tlemodel = BurstCubeTLEEntryModel

    def __init__(self, epoch: datetime):
        self.epoch = epoch
        self.tles = []


# Shorthand alias
TLE = BurstCubeTLE
