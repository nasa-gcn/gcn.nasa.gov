from datetime import datetime

from ..api_db import engine
from ..base.config import set_observatory
from ..base.tle import TLEBase
from .config import SWIFT
from .models import SwiftTLEEntryModel


@set_observatory(SWIFT)
class SwiftTLE(TLEBase):
    """
    Class that reads and updates SwiftTLEs for a given Satellite in a database,
    and returns a skyfield EarthSatellite based on SwiftTLE file for the correct epoch.


    Parameters
    ----------
    epoch : datetime
        Epoch of SwiftTLE to retrieve

    Attributes
    ----------
    tles : list
        List of SwiftTLEs for given epoch
    tle : SwiftTLEEntryModel
        SwiftTLE entry for given epoch

    Methods
    -------
    get
        Get TLE for given epoch
    tle_out_of_date
        Check if the given TLE is out of date
    read_tle_web
        Read TLE from dedicated weblink
    read_tle_heasarc
        Read TLEs in the HEASARC MISSION_TLE_ARCHIVE.tle format
    read_tle_celestrak
        Return latest TLE from Celestrak
    read_db
        Read the best TLE for a given epoch from the local database of TLEs
    write_db
        Write a TLE to the database
    read_db_all_tles
        Write all loaded TLEs to database
    """

    tlemodel = SwiftTLEEntryModel
    engine = engine

    def __init__(self, epoch: datetime):
        self.epoch = epoch
        self.tles = []


# Shorthand alias
TLE = SwiftTLE
