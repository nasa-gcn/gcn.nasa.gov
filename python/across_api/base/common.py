import os
from time import tzset
from typing import Any, Type

from fastapi import HTTPException
from pydantic import ValidationError

from .schema import BaseSchema, ConfigSchema, JobInfo

# Make sure we are working in UTC times
os.environ["TZ"] = "UTC"
tzset()


class ACROSSAPIBase:
    """Common methods for ACROSS API Classes. Most of these are to do with reading and writing classes out as JSON/dicts."""

    # Main definitions
    mission: str = "ACROSS"
    username: str = "anonymous"

    # Allowed time to cache result
    _cache_time = 300  # 300s = 5 mins

    # Schema types
    _schema: Type[BaseSchema]
    _get_schema: Type[BaseSchema]
    _put_schema: Type[BaseSchema]
    _post_schema: Type[BaseSchema]
    _del_schema: Type[BaseSchema]
    _entry_schema: Type[BaseSchema]
    config: ConfigSchema

    # Common things in API classes
    entries: list

    def __getitem__(self, i) -> Any:
        return self.entries[i]

    @property
    def api_name(self) -> str:
        """Ensure api_name is of the form MissionActivity

        Returns
        -------
        str
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

    def loads(self, model_json: str) -> bool:
        """Load attributes from JSON of API Model

        Parameters
        ----------
        model_json : str
            JSON of API Model

        Returns
        -------
        bool
            Did this work True or False?
        """
        try:
            model = self._schema.model_validate_json(model_json)
            for k in model.model_fields.keys():
                setattr(self, k, getattr(model, k))
        except ValidationError as e:
            raise HTTPException(422, e.errors())

        return True

    def validate_get(self) -> bool:
        """Validate arguments for GET

        Returns
        -------
        bool
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
        bool
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
        bool
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
        bool
            Is it validated? True | False
        """
        try:
            self._del_schema.model_validate(self.__dict__)
        except ValidationError as e:
            raise HTTPException(422, e.errors())

        return True
