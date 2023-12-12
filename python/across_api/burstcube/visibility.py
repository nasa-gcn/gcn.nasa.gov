from datetime import datetime, time, timedelta
from typing import List

from ..base.common import ACROSSAPIBase
from ..base.config import set_observatory
from ..base.schema import JobInfo, VisWindow
from ..base.visibility import VisibilityBase, VisibilityGetSchema, VisibilitySchema
from .config import BURSTCUBE
from .ephem import Ephem
from .saa import SAA


@set_observatory(BURSTCUBE)
class BurstCubeVisibility(VisibilityBase, ACROSSAPIBase):
    """Class to calculate BurstCube visibility.

    Parameters
    ----------
    ra : float
        Right Ascension in decimal degrees
    dec : float
        Declination in decimal degrees
    begin : datetime
        Start time of visibility search
    end : datetime
        End time of visibility search
    stepsize : int
        Step size in seconds for visibility calculations
    """

    # Schema for API class
    _schema = VisibilitySchema
    _get_schema = VisibilityGetSchema

    # Type hints
    username: str
    begin: datetime
    stepsize: int
    length: float
    end: datetime
    isat: bool

    # Attributes
    entries: List[VisWindow]
    status: JobInfo

    # Internal parameters
    _ephem: Ephem
    saa: SAA

    def __init__(
        self, ra: float, dec: float, begin: datetime, end: datetime, stepsize: int = 60
    ):
        # Parameters
        self.ra = ra
        self.dec = dec
        self.username = "anonymous"
        self.begin = begin
        self.stepsize = stepsize
        self.end = end
        self.isat = False
        # Attributes
        self.entries = []
        self.status = JobInfo()

        # Run GET automatically if parameters are valid, this is a GET only API
        if self.validate_get():
            # Calculate Ephemeris and SAA information. Calculate for an entire day
            # steps to aid with better caching of these computationally intensive
            # tasks.
            daybegin = datetime.combine(self.begin.date(), time())
            dayend = datetime.combine(self.end.date(), time()) + timedelta(days=1)
            self.ephem = Ephem(begin=daybegin, end=dayend, stepsize=self.stepsize)
            self.saa = SAA(begin=daybegin, end=dayend, ephem=self.ephem)
            self.get()


# BurstCube specific aliases for classes
Visibility = BurstCubeVisibility
BurstCubeVisibilityGetSchema = VisibilityGetSchema
BurstCubeVisibilitySchema = VisibilitySchema
