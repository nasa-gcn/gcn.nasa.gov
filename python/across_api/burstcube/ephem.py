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
    begin
        Start time of ephemeris search
    end
        End time of ephemeris search
    stepsize
        Step size in seconds for ephemeris calculations

    Attributes
    ----------
    datetimes
        List of datetimes for ephemeris points
    posvec
        List of S/C position vectors in km
    lat
        List of S/C latitude (degrees)
    long
        List of S/C longitude (degrees)
    velra
        List of Ra of the direction of motion (degrees)
    veldec:
        List of Dec of the direction of motion (degrees)
    beta
        List of Beta Angle of orbit
    sunpos
        List of RA/Dec of the Sun
    moonpos
        List of RA/Dec of the Moon
    sunvec
        List of vectors to the Sun from the center of the Earth
    moonvec
        List of vectors to the Moon from the center of the Earth
    ineclipse
        List of booleans indicating if the spacecraft is in eclipse
    status
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
