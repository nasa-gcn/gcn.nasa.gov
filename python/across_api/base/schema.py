# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from arc.tables import name  # type: ignore[import]
from datetime import datetime
from typing import Annotated, Any, List, Optional, Union

import astropy.units as u  # type: ignore
from astropy.coordinates import Latitude, Longitude  # type: ignore[import]
from astropy.time import Time  # type: ignore
from pydantic import (
    BaseModel,
    BeforeValidator,
    ConfigDict,
    Field,
    PlainSerializer,
    WithJsonSchema,
    computed_field,
    model_validator,
)

from .database import dynamodb_resource

# Define a Pydantic type for astropy Time objects, which will be serialized as
# a naive UTC datetime object, or a string in ISO format for JSON.
AstropyTime = Annotated[
    Time,
    BeforeValidator(lambda x: Time(x) if type(x) is not Time else x),
    PlainSerializer(
        lambda x: x.utc.datetime,
        return_type=datetime,
    ),
    WithJsonSchema(
        {"type": "string", "format": "date-time"},
        mode="serialization",
    ),
    WithJsonSchema(
        {"type": "string", "format": "date-time"},
        mode="validation",
    ),
]


# Pydantic type for a Astropy Time in seconds
AstropySeconds = Annotated[
    u.Quantity,
    BeforeValidator(lambda x: x * u.s if type(x) is not u.Quantity else x.to(u.s)),
    PlainSerializer(
        lambda x: x.to(u.s).value,
        return_type=float,
    ),
    WithJsonSchema(
        {"type": "number"},
        mode="serialization",
    ),
    WithJsonSchema(
        {"type": "number"},
        mode="validation",
    ),
]


# Pydantic type for a scalar astropy Quantity/Latitude/Longitude in degrees
AstropyAngle = Annotated[
    Union[Latitude, Longitude, u.Quantity[u.deg]],
    BeforeValidator(lambda x: x * u.deg if isinstance(x, (int, float)) else x),
    PlainSerializer(
        lambda x: x.to_value(u.deg),
        return_type=float,
    ),
    WithJsonSchema(
        {"type": "number"},
        mode="serialization",
    ),
    WithJsonSchema(
        {"type": "number"},
        mode="validation",
    ),
]


class BaseSchema(BaseModel):
    """
    Base class for schemas.

    This class provides a base implementation for schemas and defines the `from_attributes` method.
    Subclasses can inherit from this class and override the `from_attributes` method to define their own schema logic.
    """

    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)

    def __hash__(self):
        return hash((type(self),) + tuple(self.__dict__.values()))


class OptionalDateRangeSchema(BaseSchema):
    """Schema that defines date range, which is optional

    Parameters
    ----------
    begin
        The beginning date of the range, by default None
    end
        The end date of the range, by default None

    Methods
    -------
    check_dates(data: Any) -> Any
        Validates the date range and ensures that the begin and end dates are set correctly.

    """

    begin: Optional[AstropyTime] = None
    end: Optional[AstropyTime] = None

    @model_validator(mode="after")
    @classmethod
    def check_dates(cls, data: Any) -> Any:
        """Validates the date range and ensures that the begin and end dates are set correctly.

        Parameters
        ----------
        data
            The data to be validated.

        Returns
        -------
        Any
            The validated data.
        """
        if data.begin is None or data.end is None:
            assert (
                data.begin == data.end
            ), "Begin/End should both be set, or both not set"
        if data.begin != data.end:
            assert data.begin <= data.end, "End date should not be before begin"

        return data


class OptionalPositionSchema(BaseSchema):
    """
    Schema for representing position information with an error radius.

    Attributes
    ----------
    error
        The error associated with the position. Defaults to None.
    """

    ra: Optional[AstropyAngle] = Field(ge=0 * u.deg, lt=360 * u.deg, default=None)
    dec: Optional[AstropyAngle] = Field(ge=-90 * u.deg, le=90 * u.deg, default=None)
    error_radius: Optional[AstropyAngle] = None

    @model_validator(mode="after")
    @classmethod
    def check_ra_dec(cls, data: Any) -> Any:
        """Validates that RA and Dec are both set or both not set.

        Parameters
        ----------
        data
            The data to be validated.

        Returns
        -------
        Any
            The validated data.
        """
        if data.ra is None or data.dec is None:
            assert data.ra == data.dec, "RA/Dec should both be set, or both not set"
        return data


class TLEGetSchema(BaseSchema):
    epoch: AstropyTime


class TLEEntry(BaseSchema):
    """
    Represents a single TLE entry in the TLE database.

    Parameters
    ----------
    satname
        The name of the satellite from the Satellite Catalog.
    tle1
        The first line of the TLE.
    tle2
        The second line of the TLE.

    Attributes
    ----------
    epoch
    """

    __tablename__ = "acrossapi_tle"
    satname: str  # Partition Key
    tle1: str = Field(min_length=69, max_length=69)
    tle2: str = Field(min_length=69, max_length=69)

    @computed_field  # type: ignore[misc]
    @property
    def epoch(self) -> AstropyTime:
        """
        Calculate the Epoch of the TLE file. See
        https://celestrak.org/columns/v04n03/#FAQ04 for more information on
        how the year / epoch encoding works.

        Returns
        -------
            The calculated epoch of the TLE.
        """
        # Extract epoch from TLE
        tleepoch = self.tle1.split()[3]

        # Convert 2 number year into 4 number year.
        tleyear = int(tleepoch[0:2])
        if tleyear < 57:
            year = 2000 + tleyear
        else:
            year = 1900 + tleyear

        # Convert day of year into float
        day_of_year = float(tleepoch[2:])

        # Return Time epoch
        return Time(f"{year}-01-01", scale="utc") + (day_of_year - 1) * u.day

    @classmethod
    async def find_tles_between_epochs(
        cls, satname: str, start_epoch: Time, end_epoch: Time
    ) -> List[Any]:
        """
        Find TLE entries between two epochs in the TLE database for a given
        satellite TLE name.

        Arguments
        ---------
        satname
            The common name for the spacecraft based on the Satellite Catalog.
        start_epoch
            The start time over which to search for TLE entries.
        end_epoch
            The end time over which to search for TLE entries.

        Returns
        -------
            A list of TLEEntry objects between the specified epochs.
        """
        async with dynamodb_resource() as dynamodb:
            table = await dynamodb.Table(name(cls.__tablename__))

            # Query the table for TLEs between the two epochs
            response = await table.query(
                KeyConditionExpression="satname = :satname AND epoch BETWEEN :start_epoch AND :end_epoch",
                ExpressionAttributeValues={
                    ":satname": satname,
                    ":start_epoch": str(start_epoch.utc.datetime),
                    ":end_epoch": str(end_epoch.utc.datetime),
                },
            )

            # Convert the response into a list of TLEEntry objects and return them
            return [cls(**item) for item in response["Items"]]

    async def write(self) -> None:
        """Write the TLE entry to the database."""
        async with dynamodb_resource() as dynamodb:
            table = await dynamodb.Table(name(self.__tablename__))
            await table.put_item(Item=self.model_dump(mode="json"))


class TLESchema(BaseSchema):
    tle: Optional[TLEEntry]
