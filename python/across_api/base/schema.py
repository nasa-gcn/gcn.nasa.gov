from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict


class BaseSchema(BaseModel):
    """
    Base class for schemas.

    This class provides a base implementation for schemas and defines the `from_attributes` method.
    Subclasses can inherit from this class and override the `from_attributes` method to define their own schema logic.
    """

    model_config = ConfigDict(from_attributes=True)


class TLESchema(BaseSchema):
    tle: Optional[Any]


class TLEGetSchema(BaseSchema):
    epoch: datetime
