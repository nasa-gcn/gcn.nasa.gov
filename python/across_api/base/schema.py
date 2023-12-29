# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.


from datetime import datetime
from typing import Any, List, Optional

import astropy.units as u  # type: ignore
from arc import tables  # type: ignore
from astropy.time import Time  # type: ignore
from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    PlainSerializer,
    computed_field,
    model_validator,
)
from typing_extensions import Annotated

# Define a Pydantic type for astropy Time objects, which will be serialized as
# a naive UTC datetime object, or a string in ISO format for JSON. If Time is
# in list form, then it will be serialized as a list of UTC naive datetime
# objects.
AstropyTime = Annotated[
    Time,
    PlainSerializer(
        lambda x: x.utc.datetime,
        return_type=datetime,  # Union[datetime, List[datetime]],
    ),
]

AstropyTimeList = Annotated[
    Time,
    PlainSerializer(
        lambda x: x.utc.datetime.tolist(),
        return_type=List[datetime],
    ),
]


class BaseSchema(BaseModel):
    """
    Base class for schemas.

    This class provides a base implementation for schemas and defines the `from_attributes` method.
    Subclasses can inherit from this class and override the `from_attributes` method to define their own schema logic.
    """

    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)


class DateRangeSchema(BaseSchema):
    """Schema that defines date range

    Parameters
    ----------
    begin : Time
        The start date of the range.
    end : Time
        The end date of the range.

    Returns
    -------
    data : Any
        The validated data with converted dates.

    Raises
    ------
    AssertionError
        If the end date is before the begin date.

    """

    begin: AstropyTime
    end: AstropyTime

    @model_validator(mode="after")
    @classmethod
    def check_dates(cls, data: Any) -> Any:
        data.end = Time(data.end)
        data.begin = Time(data.begin)
        assert data.begin <= data.end, "End date should not be before begin"
        return data


class EphemSchema(BaseSchema):
    """
    Schema for ephemeral data.

    Attributes
    ----------
    timestamp : AstropyTime
        List of timestamps.
    posvec : List[List[float]]
        List of position vectors for the spacecraft in GCRS.
    earthsize : List[float]
        List of the angular size of the Earth to the spacecraft.
    polevec : Optional[List[List[float]]], optional
        List of orbit pole vectors, by default None.
    velvec : Optional[List[List[float]]], optional
        List of spacecraft velocity vectors, by default None.
    sunvec : List[List[float]]
        List of sun vectors.
    moonvec : List[List[float]]
        List of moon vectors.
    latitude : List[float]
        List of latitudes.
    longitude : List[float]
        List of longitudes.
    stepsize : int, optional
        Step size, by default 60.
    """

    timestamp: AstropyTimeList
    posvec: List[List[float]]
    earthsize: List[float]
    polevec: Optional[List[List[float]]] = None
    velvec: Optional[List[List[float]]] = None
    sunvec: List[List[float]]
    moonvec: List[List[float]]
    latitude: List[float]
    longitude: List[float]
    stepsize: int = 60


class EphemGetSchema(DateRangeSchema):
    """Schema to define required parameters for a GET

    Parameters
    ----------
    stepsize : int, optional
        The step size in seconds (default is 60).

    """

    stepsize: int = 60
    ...


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

        # Return Time epoch
        return Time(f"{year}-01-01", scale="utc") + (day_of_year - 1) * u.day

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
