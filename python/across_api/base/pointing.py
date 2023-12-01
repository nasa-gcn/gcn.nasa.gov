from datetime import datetime, timedelta
from typing import List

from ..functions import round_time
from .common import ACROSSAPIBase
from .schema import JobInfo, PointBase, PointingGetSchemaBase, PointingSchemaBase


class PointingBase(ACROSSAPIBase):
    """Base class for pointing calculations.

    Parameters
    ----------
    begin : datetime
        Start time of pointing search
    end : datetime
        End time of pointing search
    stepsize : int
        Step size in seconds for pointing calculations

    Attributes
    ----------
    entries : list
        List of spacecraft pointings
    """

    _schema = PointingSchemaBase
    _get_schema = PointingGetSchemaBase

    entries: List[PointBase]
    stepsize: int = 60
    begin: datetime
    end: datetime
    status: JobInfo

    @property
    def times(self) -> List[datetime]:
        begin = round_time(self.begin, self.stepsize)
        end = round_time(self.end, self.stepsize)
        number = int((end - begin).total_seconds() / self.stepsize)
        return [begin + timedelta(seconds=self.stepsize * i) for i in range(number + 1)]
