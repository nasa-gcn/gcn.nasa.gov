from datetime import datetime
from enum import Enum
from typing import List, Optional, Union

from ..base.schema import (
    BaseSchema,
    DateRangeSchema,
    JobInfo,
    OptionalCoordSchema,
    OptionalDateRangeSchema,
    OptionalPositionSchema,
    PointBase,
    PointingGetSchemaBase,
    PointingSchemaBase,
    UserSchema,
)


class TOOReason(str, Enum):
    """
    Reasons for rejecting TOO observations

    Attributes
    ----------
    saa
        In SAA
    earth_occult
        Earth occulted
    moon_occult
        Moon occulted
    sun_occult
        Sun occulted
    too_old
        Too old
    other
        Other
    none
        None
    """

    saa = "In SAA"
    earth_occult = "Earth occulted"
    moon_occult = "Moon occulted"
    sun_occult = "Sun occulted"
    too_old = "Too old"
    other = "Other"
    none = "None"


class TOOStatus(str, Enum):
    """
    Enumeration class representing the status of a Target of Opportunity (TOO) request.

    Attributes:
    requested
        The TOO request has been submitted.
    rejected
        The TOO request has been rejected.
    declined
        The TOO request has been declined.
    approved
        The TOO request has been approved.
    executed
        The TOO request has been executed.
    other
        The TOO request has a status other than the predefined ones.
    """

    requested = "Requested"
    rejected = "Rejected"
    declined = "Declined"
    approved = "Approved"
    executed = "Executed"
    other = "Other"


class BurstCubeTOOCoordSchema(OptionalPositionSchema):
    """
    Schema for BurstCube Target of Opportunity (TOO) coordinates.

    Inherits
    --------
    OptionalPositionSchema
        Schema for the position of a target with circular error.
    """

    ...


class BurstCubeTOOModelSchema(BurstCubeTOOCoordSchema):
    """
    Schema to retrieve all information about a BurstCubeTOO Request

    Parameters
    ----------
    id
        The ID of the BurstCubeTOO Request, by default None
    username
        The username associated with the BurstCubeTOO Request
    timestamp
        The timestamp of the BurstCubeTOO Request, by default None
    trigger_mission
        The mission associated with the trigger, by default None
    trigger_instrument
        The instrument associated with the trigger, by default None
    trigger_id
        The ID of the trigger, by default None
    trigger_time
        The time of the trigger, by default None
    trigger_duration
        The duration of the trigger, by default None
    classification
        The classification of the trigger, by default None
    justification
        The justification for the BurstCubeTOO Request, by default None
    begin
        The start time of the BurstCubeTOO observation, by default None
    end
        The end time of the BurstCubeTOO observation, by default None
    exposure
        The exposure time for the BurstCubeTOO observation, by default 200
    offset
        The offset for the BurstCubeTOO observation, by default -50
    reason
        The reason for the BurstCubeTOO Request, by default TOOReason.none
    too_status
        The status of the BurstCubeTOO Request, by default TOOStatus.requested
    too_info
        Additional information about the BurstCubeTOO Request, by default ""
    """

    id: Union[str, int, None] = None
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


class BurstCubeTOOPutSchema(UserSchema, BurstCubeTOOCoordSchema):
    """Schema to retrieve all information about a BurstCubeTOO Request

    Parameters
    ----------
    id
        The ID of the BurstCubeTOO Request, by default None
    username
        The username associated with the BurstCubeTOO Request
    timestamp
        The timestamp of the BurstCubeTOO Request, by default None
    trigger_mission
        The mission associated with the trigger, by default None
    trigger_instrument
        The instrument associated with the trigger, by default None
    trigger_id
        The ID of the trigger, by default None
    trigger_time
        The time of the trigger, by default None
    trigger_duration
        The duration of the trigger, by default None
    classification
        The classification of the trigger, by default None
    justification
        The justification for the BurstCubeTOO Request, by default None
    begin
        The start time of the BurstCubeTOO Request, by default None
    end
        The end time of the BurstCubeTOO Request, by default None
    exposure
        The exposure time of the BurstCubeTOO Request, by default None
    offset
        The offset of the BurstCubeTOO Request, by default None
    reason
        The reason for the BurstCubeTOO Request, by default TOOReason.none
    too_status
        The status of the BurstCubeTOO Request, by default TOOStatus.requested
    """

    id: Optional[int] = None
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


class BurstCubeTOODelSchema(UserSchema):
    """
    Schema for BurstCubeTOO DELETE API call.

    Attributes
    ----------
    id
        The ID of the BurstCubeTOODel object.
    """

    id: str


class BurstCubeTOOPostSchema(UserSchema, BurstCubeTOOCoordSchema):
    """
    Schema to submit a TOO request for BurstCube.

    Parameters
    ----------
    username
        The username associated with the request.
    trigger_mission
        The mission associated with the trigger.
    trigger_instrument
        The instrument associated with the trigger.
    trigger_id
        The ID of the trigger.
    trigger_time
        The time of the trigger.
    trigger_duration
        The duration of the trigger, default is 0.
    classification
        The classification of the trigger, default is None.
    justification
        The justification for the trigger, default is None.
    begin
        The beginning time of the trigger, default is None.
    end
        The end time of the trigger, default is None.
    exposure
        The exposure time, default is 200.
    offset
        The offset value, default is -50.
    """

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
    """Schema for the response to a BurstCubeTOO request.

    Parameters
    ----------
    status
        The status of the BurstCubeTOO request.

    Inherits
    --------
    BurstCubeTOOModelSchema
        Schema for the BurstCubeTOO request.

    """

    status: JobInfo


class BurstCubePoint(PointBase):
    ...


class BurstCubePointingSchema(PointingSchemaBase):
    ...


class BurstCubePointingGetSchema(PointingGetSchemaBase):
    ...


class BurstCubeFOVCheckGetSchema(OptionalCoordSchema, DateRangeSchema):
    """
    Schema for BurstCube FOV Check Get request.

    Parameters
    ----------
    healpix_loc
        HEALPix map localization.
    stepsize
        Step size in seconds, by default 60.
    earthoccult
        Flag indicating whether to consider Earth occultation, by default True.
    """

    healpix_loc: Optional[list] = None
    stepsize: int = 60
    earthoccult: bool = True


class BurstCubeFOVCheckSchema(BaseSchema):
    """
    Schema for BurstCube FOV Check.

    Attributes
    ----------
    entries
        List of BurstCube points.
    status
        Information about the job status.
    """

    entries: List[BurstCubePoint]
    status: JobInfo


class BurstCubeTOOGetSchema(UserSchema):
    """
    Schema for BurstCubeTOO GET request.

    Parameters
    ----------
    id
        The ID of the BurstCube TOO.
    """

    id: str


class BurstCubeTOORequestsGetSchema(
    UserSchema, OptionalPositionSchema, OptionalDateRangeSchema
):
    """
    Schema for GET requests to retrieve BurstCube Target of Opportunity (TOO) requests.

    Parameters:
    -----------
    ra
        The right ascension of the TOO requests.
    dec
        The declination of the TOO requests.
    radius
        The radius around the target coordinates to search for TOO requests.
    begin
        The start time of the TOO requests.
    end
        The end time of the TOO requests.
    trigger_time
        The trigger time of the TOO requests.
    trigger_mission
        The mission associated with the trigger of the TOO requests.
    trigger_instrument
        The instrument associated with the trigger of the TOO requests.
    trigger_id
        The ID of the trigger associated with the TOO requests.
    limit
        The maximum number of TOO requests to retrieve.
    """

    trigger_time: Optional[datetime] = None
    trigger_mission: Optional[str] = None
    trigger_instrument: Optional[str] = None
    trigger_id: Optional[str] = None
    limit: Optional[int] = None


class BurstCubeTOORequestsSchema(BaseSchema):
    """
    Schema for BurstCube TOO requests.

    Attributes
    ----------
    entries
        List of BurstCube TOOs.
    status
        Job information.
    """

    entries: List[BurstCubeTOOModelSchema]
    status: JobInfo
