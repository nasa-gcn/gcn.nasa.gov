# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from datetime import datetime
from typing import Any, Optional

from astropy.time import Time  # type: ignore
from pydantic import BaseModel, ConfigDict, PlainSerializer, WithJsonSchema
from typing_extensions import Annotated

# Define a Pydantic type for astropy Time objects, which will be serialized as
# a UTC datetime object, or a string in ISO format for JSON.
AstropyTime = Annotated[
    Time,
    PlainSerializer(lambda x: x.utc.datetime, return_type=datetime),
    WithJsonSchema({"type": "string"}, mode="serialization"),
]


class BaseSchema(BaseModel):
    """
    Base class for schemas.

    This class provides a base implementation for schemas and defines the `from_attributes` method.
    Subclasses can inherit from this class and override the `from_attributes` method to define their own schema logic.
    """

    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)


class TLESchema(BaseSchema):
    tle: Optional[Any]


class TLEGetSchema(BaseSchema):
    epoch: AstropyTime
