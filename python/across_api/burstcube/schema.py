from datetime import datetime
from enum import Enum
from typing import List, Optional

from ..base.schema import (
    BaseSchema,
    DateRangeSchema,
    JobInfo,
    OptionalCoordSchema,
    PointBase,
    PointingGetSchemaBase,
    PointingSchemaBase,
    UserSchema,
)


class TOOReason(str, Enum):
    """Reasons for rejecting TOO observations"""

    saa = "In SAA"
    earth_occult = "Earth occulted"
    moon_occult = "Moon occulted"
    sun_occult = "Sun occulted"
    too_old = "Too old"
    other = "Other"
    none = "None"


class TOOStatus(str, Enum):
    requested = "Requested"
    rejected = "Rejected"
    declined = "Declined"
    approved = "Approved"
    executed = "Executed"
    other = "Other"


class BurstCubeTOOCoordSchema(OptionalCoordSchema):
    error: Optional[float] = None


class BurstCubeTOOModelSchema(BurstCubeTOOCoordSchema):
    """Schema to retrieve all information about a BurstCubeTOO Request"""

    id: Optional[int] = None
    username: str
    timestamp: Optional[datetime] = None
    trigger_mission: Optional[str] = None
    trigger_instrument: Optional[str] = None
    trigger_id: Optional[str] = None
    trigger_time: Optional[datetime] = None
    trigger_duration: Optional[float] = None
    classification: Optional[str] = None
    justification: Optional[str] = None
    begin: Optional[datetime] = None
    end: Optional[datetime] = None
    exposure: float = 200
    offset: float = -50
    reason: TOOReason = TOOReason.none
    too_status: TOOStatus = TOOStatus.requested
    too_info: str = ""


class BurstCubeTOOPutSchema(BurstCubeTOOCoordSchema):
    """Schema to retrieve all information about a BurstCubeTOO Request"""

    id: Optional[int] = None
    username: str
    timestamp: Optional[datetime] = None
    trigger_mission: Optional[str] = None
    trigger_instrument: Optional[str] = None
    trigger_id: Optional[str] = None
    trigger_time: Optional[datetime] = None
    trigger_duration: Optional[float] = None
    classification: Optional[str] = None
    justification: Optional[str] = None
    begin: Optional[datetime] = None
    end: Optional[datetime] = None
    exposure: Optional[float] = None
    offset: Optional[float] = None
    reason: TOOReason = TOOReason.none
    too_status: TOOStatus = TOOStatus.requested


class BurstCubeTOODelSchema(BaseSchema):
    id: int


class BurstCubeTOOPostSchema(BurstCubeTOOCoordSchema):
    """Schema to retrieve all information about a BurstCubeTOO Request"""

    username: str
    trigger_mission: str
    trigger_instrument: str
    trigger_id: str
    trigger_time: datetime
    trigger_duration: Optional[float] = 0
    classification: Optional[str] = None
    justification: Optional[str] = None
    begin: Optional[datetime] = None
    end: Optional[datetime] = None
    exposure: float = 200
    offset: float = -50


class BurstCubeTOOSchema(BurstCubeTOOModelSchema):
    """Schema for the response to a BurstCubeTOO request."""

    status: JobInfo


class BurstCubePoint(PointBase):
    pass


class BurstCubePointingSchema(PointingSchemaBase):
    pass


class BurstCubePointingGetSchema(PointingGetSchemaBase):
    pass


class BurstCubeFOVCheckGetSchema(OptionalCoordSchema, DateRangeSchema):
    healpix_loc: Optional[list] = None
    stepsize: int = 60
    earthoccult: bool = True


class BurstCubeFOVCheckSchema(BaseSchema):
    entries: List[BurstCubePoint]
    status: JobInfo


class BurstCubeTOOGetSchema(BaseSchema):
    id: int


class BurstCubeTOORequestsGetSchema(UserSchema):
    begin: Optional[datetime] = None
    end: Optional[datetime] = None
    trigger_time: Optional[datetime] = None
    trigger_mission: Optional[str] = None
    trigger_instrument: Optional[str] = None
    trigger_id: Optional[str] = None
    limit: Optional[int] = None
    ra: Optional[float] = None
    dec: Optional[float] = None
    radius: Optional[float] = None


class BurstCubeTOORequestsSchema(BaseSchema):
    entries: List[BurstCubeTOOModelSchema]
    status: JobInfo
