# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.


from enum import Enum
import json
from typing import List, Optional

import astropy.units as u  # type: ignore
from astropy.time import Time  # type: ignore
from pydantic import ConfigDict, model_validator  # type: ignore

from ..base.schema import (
    AstropySeconds,
    AstropyTime,
    BaseSchema,
    OptionalDateRangeSchema,
    OptionalPositionSchema,
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
    deleted = "Deleted"
    other = "Other"


class BurstCubeTriggerInfo(BaseSchema):
    """
    Metadata schema for the BurstCube Target of Opportunity (TOO) request. Note
    that this schema is not strictly defined, keys are only suggested, and
    additional keys can be added as needed.
    """

    trigger_name: Optional[str] = None
    trigger_mission: Optional[str] = None
    trigger_instrument: Optional[str] = None
    trigger_id: Optional[str] = None
    trigger_duration: Optional[AstropySeconds] = None
    classification: Optional[str] = None
    justification: Optional[str] = None

    model_config = ConfigDict(extra="allow")

    @model_validator(mode="before")
    def convert_json_string_to_dict(cls, data):
        if isinstance(data, str):
            return json.loads(data)
        return data


class BurstCubeTOOSchema(OptionalPositionSchema):
    """
    Schema describing a BurstCube TOO Request.
    """

    __tablename__ = "burstcube_too"
    id: Optional[str] = None
    created_by: str
    created_on: AstropyTime
    modified_by: Optional[str] = None
    modified_on: Optional[AstropyTime] = None
    trigger_time: AstropyTime
    trigger_info: BurstCubeTriggerInfo
    exposure: AstropySeconds
    offset: AstropySeconds
    reject_reason: TOOReason = TOOReason.none
    status: TOOStatus = TOOStatus.requested
    too_info: str = ""


class BurstCubeTOODelSchema(BaseSchema):
    """
    Schema for BurstCubeTOO DELETE API call.

    Attributes
    ----------
    id
        The ID of the BurstCubeTOODel object.
    """

    id: str


class BurstCubeTOOPostSchema(OptionalPositionSchema):
    """
    Schema to submit a TOO request for BurstCube.
    """

    trigger_time: AstropyTime
    trigger_info: BurstCubeTriggerInfo
    exposure: AstropySeconds = 200 * u.s
    offset: AstropySeconds = -50 * u.s


class BurstCubeTOOGetSchema(BaseSchema):
    """
    Schema for BurstCubeTOO GET request.
    """

    id: str


class BurstCubeTOOPutSchema(BurstCubeTOOPostSchema):
    """
    Schema for BurstCubeTOO PUT request.
    """

    id: str


class BurstCubeTOORequestsGetSchema(OptionalDateRangeSchema):
    """
    Schema for GET requests to retrieve BurstCube Target of Opportunity (TOO) requests.
    """

    length: Optional[u.Quantity] = None
    limit: Optional[int] = None

    @model_validator(mode="after")
    def check_begin_and_end_or_length_set(self):
        if self.begin is not None and self.end is not None and self.length is not None:
            raise ValueError("Cannot set both begin and end and length.")
        elif self.begin is not None and self.length is not None:
            self.end = self.begin + self.length
        elif self.begin is None and self.end is None and self.length is not None:
            self.end = Time.now()
            self.begin = self.end - self.length


class BurstCubeTOORequestsSchema(BaseSchema):
    """
    Schema for BurstCube TOO requests.
    """

    entries: List[BurstCubeTOOSchema]
