from datetime import datetime
from typing import Optional

from ..base.common import ACROSSAPIBase
from ..base.config import set_observatory
from ..base.ephem import EphemBase, EphemSchema
from ..base.schema import JobInfo
from ..base.tle import TLEEntry
from .config import BURSTCUBE
from .tle import TLE


@set_observatory(BURSTCUBE)
class Ephem(EphemBase, ACROSSAPIBase):
    """
    Class to generate BurstCube ephemeris. Generate on the fly an ephemeris for Satellite from TLE.

    Parameters
    ----------
    begin : datetime
        Start time of ephemeris search
    end : datetime
        End time of ephemeris search
    stepsize : int
        Step size in seconds for ephemeris calculations

    Attributes
    ----------
    datetimes : list
        List of datetimes for ephemeris points
    posvec : list
        List of S/C position vectors in km
    lat : list
        List of S/C latitude (degrees)
    long : list
        List of S/C longitude (degrees)
    velra : list
        List of Ra of the direction of motion (degrees)
    veldec:
        List of Dec of the direction of motion (degrees)
    beta : list
        List of Beta Angle of orbit
    sunpos : list
        List of RA/Dec of the Sun
    moonpos : list
        List of RA/Dec of the Moon
    sunvec : list
        List of vectors to the Sun from the center of the Earth
    moonvec : list
        List of vectors to the Moon from the center of the Earth
    ineclipse : list
        List of booleans indicating if the spacecraft is in eclipse
    status : JobInfo
        Status of ephemeris query
    """

    _schema = EphemSchema
    # _arg_schema: EphemArgSchema = EphemArgSchema

    def __init__(self, begin: datetime, end: datetime, stepsize: int = 60):
        EphemBase.__init__(self)
        # Default values
        self.status = JobInfo()
        self.tle: Optional[TLEEntry] = TLE(begin).get()

        # Parse argument keywords
        self.begin = begin
        self.end = end
        self.stepsize = stepsize

        # Validate and process API call
        if self.validate_get():
            # Perform GET
            self.get()


BurstCubeEphem = Ephem
