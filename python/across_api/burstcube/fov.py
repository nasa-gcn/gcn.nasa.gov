from datetime import datetime, time, timedelta
from typing import Optional

import numpy as np

from ..across.jobs import check_cache, register_job
from ..base.config import set_observatory
from ..base.fov import FOVCheckBase
from ..base.schema import JobInfo
from ..burstcube.config import BURSTCUBE
from .ephem import BurstCubeEphem
from .pointing import BurstCubePointing
from .schema import BurstCubeFOVCheckGetSchema, BurstCubeFOVCheckSchema


@set_observatory(BURSTCUBE)
class BurstCubeFOVCheck(FOVCheckBase):
    """Class to calculate if a given source is in the BurstCube FOV at a given time.

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

    Attributes
    ----------
    entries : List[BurstCubePointing]
        List of BurstCubePointing entries
    status : JobInfo
        Info about BurstCubeFOVCheck query
    """

    _schema = BurstCubeFOVCheckSchema
    _get_schema = BurstCubeFOVCheckGetSchema

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
        self.instrument = "BurstCube"
        self.entries = []

        # Validate the input
        if self.validate_get():
            self.get()

    @check_cache
    @register_job
    def get(self):
        """Calculate list of BurstCubePointing entries for a given date range.

        Returns
        -------
        bool
            True
        """
        # Load Pointings into the entries
        self.entries = BurstCubePointing(
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
        self.ephem = BurstCubeEphem(begin=begin, end=end, stepsize=self.stepsize)
        return super().get()


# Short hand aliases
FOVCheck = BurstCubeFOVCheck
