from datetime import datetime, timedelta
from typing import Optional

from shapely import Point, Polygon  # type: ignore

from ..across.jobs import check_cache, register_job
from .common import ACROSSAPIBase
from .ephem import EphemBase
from .schema import JobInfo, SAAEntry, SAAGetSchema, SAASchema


class SAAPolygonBase:
    """
    Simple class to define the Mission SAA Polygon.

    Attributes
    ----------
    points : list
        List of points defining the SAA polygon.
    saapoly : Polygon
        Shapely Polygon object defining the SAA polygon.

    """

    points: list = [
        (39.0, -30.0),
        (36.0, -26.0),
        (28.0, -21.0),
        (6.0, -12.0),
        (-5.0, -6.0),
        (-21.0, 2.0),
        (-30.0, 3.0),
        (-45.0, 2.0),
        (-60.0, -2.0),
        (-75.0, -7.0),
        (-83.0, -10.0),
        (-87.0, -16.0),
        (-86.0, -23.0),
        (-83.0, -30.0),
    ]

    saapoly: Polygon = Polygon(points)

    def insaa(self, lat: float, lon: float) -> bool:
        return self.saapoly.contains(Point(lat, lon))


class SAABase(ACROSSAPIBase):
    """
    Base class for SAA calculations.

    Attributes
    ----------
    begin : datetime
        Start time of SAA search
    end : datetime
        End time of SAA search
    ephem : Optional[Ephem]
        Ephem object to use for SAA calculations
    saa : SAAPolygonBase
        SAA Polygon object to use for SAA calculations
    status : JobInfo
        Status of SAA query
    """

    _schema = SAASchema
    _get_schema = SAAGetSchema

    begin: datetime
    end: datetime

    # Internal things
    saa: SAAPolygonBase
    ephem: EphemBase
    status: JobInfo
    stepsize: int
    _insaa: Optional[list]
    entries: Optional[list]  # type: ignore

    @check_cache
    @register_job
    def get(self) -> bool:
        """Calculate list of SAA entries for a given date range.

        Returns
        -------
        bool
            Did the query succeed?
        """
        # Validate Query
        if not self.validate_get():
            return False

        # Calculate SAA windows
        self.entries = self.make_windows([not s for s in self.insaacons])

        return True

    def make_windows(self, inconstraint: list, wintype=SAAEntry) -> list:
        """
        Record VisWindows from inconstraint array

        Parameters
        ----------
        inconstraint : list
            List of booleans indicating if the spacecraft is in the SAA
        wintype : VisWindow
            Type of window to create (default: VisWindow)

        Returns
        -------
        list
            List of VisWindow objects
        """
        windows = []
        inocc = True
        istart = self.ephem.ephindex(self.begin)
        istop = self.ephem.ephindex(self.end) + 1
        for i in range(istart, istop):
            dttime = self.ephem.timestamp[i]
            if inconstraint[i] is False:
                lastgood = dttime
            if inocc is True and not inconstraint[i]:
                inocc = False
                intime = dttime
            elif inocc is False and inconstraint[i]:
                inocc = True
                if intime != dttime - timedelta(seconds=self.ephem.stepsize):  # type: ignore
                    windows.append(wintype(begin=intime, end=lastgood))  # type: ignore
        if not inocc:
            win = wintype(begin=intime, end=lastgood)  # type: ignore
            if win.length > 0:
                windows.append(win)
        return windows

    @property
    def insaacons(self) -> list:
        """
        Calculate SAA constraint using SAA Polygon

        Returns
        -------
        list
            List of booleans indicating if the spacecraft is in the SAA

        """
        if self._insaa is None:
            if self.entries is None:
                self._insaa = [
                    self.saa.insaa(self.ephem.longitude[i], self.ephem.latitude[i])
                    for i in range(len(self.ephem))
                ]
            else:
                # Calculate insaacons array if windows already exist
                begin = self.begin
                end = self.end
                self._insaa = []
                for i in range(0, int((end - begin).total_seconds()), self.stepsize):
                    dt = begin + timedelta(seconds=i * self.stepsize)
                    inwin = [
                        True
                        for win in self.entries
                        if dt >= win.begin and dt <= win.end
                    ]
                    if True in inwin:
                        self._insaa.append(1)
                    else:
                        self._insaa.append(0)
        return self._insaa
