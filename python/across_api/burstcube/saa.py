from datetime import datetime
from typing import Optional

from shapely.geometry import Polygon  # type: ignore

from ..base.config import set_observatory
from ..base.saa import SAABase, SAAGetSchema, SAAPolygonBase, SAASchema
from ..base.schema import JobInfo
from .config import BURSTCUBE
from .ephem import Ephem


class BurstCubeSAAPolygon(SAAPolygonBase):
    """Class to define the BurstCube SAA polygon.

    Attributes
    ----------
    points
        List of points defining the SAA polygon.
    saapoly
        Shapely Polygon object defining the SAA polygon.
    """

    points: list = [
        (33.900000, -30.0),
        (12.398, -19.876),
        (-9.103, -9.733),
        (-30.605, 0.4),
        (-38.4, 2.0),
        (-45.0, 2.0),
        (-65.0, -1.0),
        (-84.0, -6.155),
        (-89.2, -8.880),
        (-94.3, -14.220),
        (-94.3, -18.404),
        (-84.48631, -31.84889),
        (-86.100000, -30.0),
        (-72.34921, -43.98599),
        (-54.5587, -52.5815),
        (-28.1917, -53.6258),
        (-0.2095279, -46.88834),
        (28.8026, -34.0359),
        (33.900000, -30.0),
    ]

    saapoly: Polygon = Polygon(points)


@set_observatory(BURSTCUBE)
class BurstCubeSAA(SAABase):
    """Class to calculate BurstCube SAA entries.

    Parameters
    ----------
    begin
        Start time of SAA search
    end
        End time of SAA search
    ephem
        Ephem object to use for SAA calculations
    stepsize
        Step size in seconds for SAA calculations

    Attributes
    ----------
    entries
        List of SAA entries
    status
        Status of SAA query
    """

    _schema = SAASchema
    _get_schema = SAAGetSchema

    # Internal things
    saa = BurstCubeSAAPolygon()
    ephem: Ephem
    begin: datetime
    end: datetime
    stepsize: int

    def __init__(
        self,
        begin: datetime,
        end: datetime,
        ephem: Optional[Ephem] = None,
        stepsize: int = 60,
    ):
        # Attributes
        self.status: JobInfo = JobInfo()
        self._insaacons: Optional[list] = None
        self.entries = None

        # Parameters
        self.begin = begin
        self.end = end
        if ephem is None:
            self.ephem = Ephem(begin=begin, end=end, stepsize=stepsize)
            self.stepsize = stepsize
        else:
            self.ephem = ephem
            # Make sure stepsize matches supplied ephemeris
            self.stepsize = ephem.stepsize

        # If request validates, query
        if self.validate_get():
            self.get()

    @classmethod
    def insaa(cls, dttime: datetime) -> bool:
        """
        For a given datetime, are we in the SAA?

        Parameters
        ----------
        dttime
            Time at which to calculate if we're in SAA

        Returns
        -------
        bool
            True if we're in the SAA, False otherwise
        """
        # Calculate an ephemeris for the exact time requested
        ephem = Ephem(begin=dttime, end=dttime)  # type: ignore
        return cls.saa.insaa(ephem.longitude[0], ephem.latitude[0])


# Class alias
SAA = BurstCubeSAA
