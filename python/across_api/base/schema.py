# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.


from datetime import datetime
from typing import Optional

import astropy.units as u  # type: ignore
from arc import tables  # type: ignore
from astropy.time import Time  # type: ignore
from astropy.time import TimeDelta  # type: ignore
from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    PlainSerializer,
    WithJsonSchema,
    computed_field,
)
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


class TLEGetSchema(BaseSchema):
    epoch: AstropyTime


class TLEEntry(BaseSchema):
    """
    Represents a single TLE entry in the TLE database.

    Parameters
    ----------
    satname : str
        The name of the satellite from the Satellite Catalog.
    tle1 : str
        The first line of the TLE.
    tle2 : str
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

        # Return datetime epoch
        return Time(f"{year}-01-01", scale="utc") + TimeDelta((day_of_year - 1) * u.day)

    @classmethod
    def find_tles_between_epochs(
        cls, satname: str, start_epoch: Time, end_epoch: Time
    ) -> list:
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
        table = tables.table(cls.__tablename__)

        # Query the table for TLEs between the two epochs
        response = table.query(
            KeyConditionExpression="satname = :satname AND epoch BETWEEN :start_epoch AND :end_epoch",
            ExpressionAttributeValues={
                ":satname": satname,
                ":start_epoch": str(start_epoch.utc.datetime),
                ":end_epoch": str(end_epoch.utc.datetime),
            },
        )

        # Convert the response into a list of TLEEntry objects and return them
        return [cls(**item) for item in response["Items"]]

    def write(self):
        """Write the TLE entry to the database."""
        table = tables.table(self.__tablename__)
        table.put_item(Item=self.model_dump(mode="json"))


class TLESchema(BaseSchema):
    tle: Optional[TLEEntry]
