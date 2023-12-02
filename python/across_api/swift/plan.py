import os
from datetime import datetime
from typing import List, Optional, Type, Union

from ..across.jobs import check_cache, register_job
from ..across.user import check_api_key
from ..base.config import set_observatory
from ..base.plan import PlanBase
from ..base.schema import ConfigSchema, JobInfo
from .config import SWIFT
from .models import SwiftPlanEntryModel
from .schema import SwiftPlanEntry, SwiftPlanGetSchema, SwiftPlanSchema


@set_observatory(SWIFT)
class SwiftPlan(PlanBase):
    """
    Class to calculate Swift spacecraft Planned observations. This class is
    used to query the Swift database for planned observations. It is not used
    to calculate planned observations. The Swift database is updated every
    regularly with the latest planned observations.

    Parameters
    ----------
    username : str
        Swift username
    api_key : str
        Swift API key
    ra : float
        Right Ascension in decimal degrees
    dec : float
        Declination in decimal degrees
    begin : datetime
        Start time of visibility search
    end : datetime
        End time of visibility search
    radius : float
        Search radius in degrees (default: XRT FOV)
    limit : int
        Maximum number of entries to return (default: 1000)
    obsid : str, list
        Swift observation ID(s) (default: None)
    targetid : int, list
        Swift target ID(s) (default: None)

    Attributes
    ----------
    entries : list
        List of SwiftPlanEntry entries
    status : JobInfo
        Info about SwiftPlan query
    plan_max : datetime
        Latest observation planned in the plan database
    """

    _schema = SwiftPlanSchema  # type: ignore
    _put_schema = SwiftPlanGetSchema
    _get_schema = SwiftPlanGetSchema
    _entry_model = SwiftPlanEntryModel
    _entry_schema: Type[SwiftPlanEntry] = SwiftPlanEntry
    config: ConfigSchema

    def __init__(
        self,
        username: str = "anonymous",
        api_key: str = "anonymous",
        ra: Optional[float] = None,
        dec: Optional[float] = None,
        begin: Optional[datetime] = None,
        end: Optional[datetime] = None,
        obsid: Union[str, list, None] = None,
        targetid: Union[int, list, None] = None,
        radius: Optional[float] = None,
    ):
        self.username = username
        self.api_key = api_key
        self.obsid = obsid
        self.targetid = targetid
        self.begin = begin
        self.end = end
        self.ra = ra
        self.dec = dec
        if radius is not None:
            self.radius = radius
        else:
            # Use XRT FOV as the default search radius
            self.radius = self.config.instruments[1].fov.dimension
        self.plan_max: Optional[datetime] = None
        self.entries: List[SwiftPlanEntry] = list()
        self.status: JobInfo = JobInfo()

    def __getitem__(self, i) -> SwiftPlanEntry:
        return self.entries[i]

    @check_api_key(anon=False, requser=["jak51", "swift"])
    @register_job
    def put(self) -> bool:
        """
        Put a SwiftPlan into the database.

        Returns
        -------
        bool
            Success or failure of put
        """
        return super().put()

    @check_cache
    @register_job
    def get(self) -> Optional[bool]:
        """
        Get a SwiftPlan from the database.

        Returns
        -------
        bool
            Success or failure of get
        """
        return super().get()

    def which_entry(self, dt: datetime) -> Optional[SwiftPlanEntry]:
        """Return a PlanEntry for a give datetime.

        Parameters
        ----------
        dt : datetime
            Time at which you are querying for a plan entry

        Returns
        -------
        Optional[PlanEntryBase]
            Return Plan Entry for a given time, or None if none exists
        """
        ent = [e for e in self.entries if e.end > dt and e.begin <= dt]
        if ent == []:
            return None
        return ent[0]


# Mission specific names for classes
Plan = SwiftPlan
PlanSchema = SwiftPlanSchema
PlanEntry = SwiftPlanEntry


# If we're in a dev environment, create the table if it doesn't exist
if os.environ.get("ARC_SANDBOX") is not None:
    SwiftPlanEntryModel.create_table()
