from typing import List, Literal, Optional

from ..base.schema import (
    BaseSchema,
    DateRangeSchema,
    JobInfo,
    OptionalCoordSchema,
    PlanEntryBase,
    PlanGetSchemaBase,
    PlanSchemaBase,
    PointBase,
    PointingGetSchemaBase,
    PointingSchemaBase,
    UserSchema,
)


class SwiftPlanEntry(PlanEntryBase):
    roll: float
    obsid: str
    targetid: int
    segment: int
    xrtmode: int
    uvotmode: int
    batmode: int
    merit: int


class SwiftPlanGetSchema(PlanGetSchemaBase):
    pass


class SwiftPlanPutSchema(UserSchema):
    entries: List[SwiftPlanEntry]


class SwiftPlanEntriesSchema(BaseSchema):
    entries: List[SwiftPlanEntry]


class SwiftPlanSchema(PlanSchemaBase):
    entries: List[SwiftPlanEntry]  # type: ignore


class SwiftPoint(PointBase):
    roll: Optional[float]
    pass


class SwiftPointingSchema(PointingSchemaBase):
    pass


class SwiftPointingGetSchema(PointingGetSchemaBase):
    pass


class SwiftObsEntry(PlanEntryBase):
    slew: int
    roll: float
    obsid: str
    targetid: int
    segment: int
    xrtmode: int
    uvotmode: int
    batmode: int
    merit: int


class SwiftObservationsGetSchema(PlanGetSchemaBase):
    pass


class SwiftObservationsPutSchema(UserSchema):
    entries: List[SwiftObsEntry]
    pass


class SwiftObservationsSchema(PlanSchemaBase):
    entries: List[SwiftObsEntry]  # type: ignore


class SwiftFOVCheckGetSchema(OptionalCoordSchema, DateRangeSchema):
    healpix_loc: Optional[list] = None
    healpix_order: str = "nested"
    stepsize: int = 60
    earthoccult: bool = True
    instrument: Literal["XRT", "UVOT", "BAT"] = "XRT"


class SwiftFOVCheckSchema(BaseSchema):
    entries: List[SwiftPoint]
    status: JobInfo
