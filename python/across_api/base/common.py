# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

import os
from time import tzset
from typing import Any, List, Type

import astropy.units as u  # type: ignore
import numpy as np
from astropy.time import Time  # type: ignore
from fastapi import HTTPException
from pydantic import ValidationError

from .schema import BaseSchema

# Make sure we are working in UTC times
os.environ["TZ"] = "UTC"
tzset()


def round_time(t: Time, step: u.Quantity) -> Time:
    """
    Round an astropy Time object to a given time step. So for example, if
    step=1*u.s, then the time will be rounded to the nearest second. If step
    is 1*u.min, then the time will be rounded to the nearest minute.

    Parameters
    ----------
    t
        The time to round.
    step
        The time step to round to.

    Returns
    -------
        The rounded Time.
    """
    return Time(
        np.round(t.unix / step.to_value(u.s)) * step.to_value(u.s), format="unix"
    )


class ACROSSAPIBase:
    """Common methods for ACROSS API Classes. Most of these are to do with reading and writing classes out as JSON/dicts."""

    # Main definitions
    mission: str = "ACROSS"

    # Allowed time to cache result
    _cache_time = 300  # 300s = 5 mins

    # Schema types
    _schema: Type[BaseSchema]
    _get_schema: Type[BaseSchema]
    _put_schema: Type[BaseSchema]
    _post_schema: Type[BaseSchema]
    _del_schema: Type[BaseSchema]
    _entry_schema: Type[BaseSchema]

    # Common things in API classes
    entries: List[Any] = []

    def __getitem__(self, i: int) -> Any:
        return self.entries[i]

    @property
    def api_name(self) -> str:
        """Ensure api_name is of the form MissionActivity

        Returns
        -------
            API Name
        """
        return f"{self.mission}{self.__class__.__name__.replace(self.mission,'')}"

    @property
    def schema(self) -> Any:
        """Return pydantic schema for this API class

        Returns
        -------
        object
            Pydantic Schema
        """
        return self._schema.model_validate(self)

    def validate_get(self) -> bool:
        """Validate arguments for GET

        Returns
        -------
            Do arguments validate? True | False
        """
        try:
            self._get_schema.model_validate(self)
        except ValidationError as e:
            raise HTTPException(422, e.errors())
        return True

    def validate_put(self) -> bool:
        """Validate if value to be PUT matches Schema

        Returns
        -------
            Is it validated? True | False
        """
        try:
            self._put_schema.model_validate(self.__dict__)
        except ValidationError as e:
            raise HTTPException(422, e.errors())
        return True

    def validate_post(self) -> bool:
        """Validate if value to be POST matches Schema

        Returns
        -------
            Is it validated? True | False
        """
        try:
            self._post_schema.model_validate(self.__dict__)
        except ValidationError as e:
            raise HTTPException(422, e.errors())

        return True

    def validate_del(self) -> bool:
        """Validate if value to be POST matches Schema

        Returns
        -------
            Is it validated? True | False
        """
        try:
            self._del_schema.model_validate(self.__dict__)
        except ValidationError as e:
            raise HTTPException(422, e.errors())

        return True
