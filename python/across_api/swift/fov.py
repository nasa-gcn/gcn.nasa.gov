from datetime import datetime, time, timedelta
from typing import Literal, Optional

import numpy as np

from ..across.jobs import check_cache, register_job
from ..base.config import set_observatory
from ..base.fov import FOVCheckBase
from ..base.schema import JobInfo
from ..swift.config import SWIFT
from .ephem import SwiftEphem
from .pointing import SwiftPointing
from .schema import SwiftFOVCheckGetSchema, SwiftFOVCheckSchema


@set_observatory(SWIFT)
class SwiftFOVCheck(FOVCheckBase):
    """Class to calculate if a given source is in the Swift FOV at a given time.

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
    earthoccult : bool
        Calculate Earth occultation (default: True)
    instrument : Literal["XRT", "UVOT", "BAT"]
        Instrument to check (default: "XRT")

    Attributes
    ----------
    entries : List[SwiftPointing]
        List of SwiftPointing entries
    status : JobInfo
        Info about SwiftFOVCheck query
    """

    _schema = SwiftFOVCheckSchema
    _get_schema = SwiftFOVCheckGetSchema

    def __init__(
        self,
        begin: datetime,
        end: datetime,
        ra: Optional[float] = None,
        dec: Optional[float] = None,
        healpix_loc: Optional[np.ndarray] = None,
        healpix_order: str = "nested",
        stepsize: int = 60,
        earthoccult: bool = True,
        instrument: Literal["XRT", "UVOT", "BAT"] = "XRT",
    ):
        self.ra = ra
        self.dec = dec
        self.healpix_loc = healpix_loc
        self.healpix_order = healpix_order
        self.begin = begin
        self.end = end
        self.stepsize = stepsize
        self.earthoccult = earthoccult
        self.status = JobInfo()
        self.instrument = instrument
        self.entries = []

        # Validate the input
        if self.validate_get():
            self.get()

    @check_cache
    @register_job
    def get(self):
        """Calculate list of SwiftPointing entries for a given date range.

        Returns
        -------
        bool
            True
        """
        # Load Pointings into the entries
        self.entries = SwiftPointing(
            begin=self.begin, end=self.end, stepsize=self.stepsize
        ).entries

        # Load Ephemeris
        if self.stepsize == 60:
            # If this is a 60s ephemeris, then do this as there's probably a cached one
            begin = datetime.combine(self.begin.date(), time())
            end = datetime.combine(self.end.date(), time()) + timedelta(days=1)
        else:
            begin = self.begin
            end = self.end
        self.ephem = SwiftEphem(begin=begin, end=end, stepsize=self.stepsize)
        return super().get()


# Short hand aliases
FOVCheck = SwiftFOVCheck
