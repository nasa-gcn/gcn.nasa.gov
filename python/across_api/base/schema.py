# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.


import io
from datetime import datetime
from typing import IO, Annotated, Any, List, Optional, Union

import astropy.units as u  # type: ignore
from arc import tables  # type: ignore
from astropy.coordinates import (  # type: ignore
    CartesianRepresentation,
    Latitude,
    Longitude,
    SkyCoord,
)
from astropy.time import Time  # type: ignore
from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    PlainSerializer,
    computed_field,
    conlist,
    model_validator,
)

# Define a Pydantic type for astropy Time objects, which will be serialized as
# a naive UTC datetime object, or a string in ISO format for JSON.
AstropyTime = Annotated[
    Time,
    PlainSerializer(
        lambda x: x.utc.datetime,
        return_type=datetime,
    ),
]
# Define a Pydantic type for list-type astropy Time objects, which will be
# serialized as a list of naive UTC datetime objects, or a list of strings in
# ISO format for JSON.
AstropyTimeList = Annotated[
    Time,
    PlainSerializer(
        lambda x: x.utc.datetime.tolist(),
        return_type=List[datetime],
    ),
]

AstropyAngle = Annotated[
    u.Quantity,
    PlainSerializer(
        lambda x: x.deg,
        return_type=float,
    ),
]

# Pydantic type to serialize astropy SkyCoord or CartesianRepresentation objects as a list
# of vectors in units of km
AstropyPositionVector = Annotated[
    Union[CartesianRepresentation, SkyCoord],
    PlainSerializer(
        lambda x: (
            x.xyz.to(u.km).value.T.tolist()
            if type(x) is CartesianRepresentation
            else x.cartesian.xyz.to(u.km).value.T.tolist()
        ),
        return_type=List[conlist(float, min_length=3, max_length=3)],  # type: ignore
    ),
]

# Pydantic type to serialize astropy CartesianRepresentation velocity objects as a list
# of vectors in units of km/s
AstropyVelocityVector = Annotated[
    CartesianRepresentation,
    PlainSerializer(
        lambda x: x.xyz.to(u.km / u.s).value.T.tolist(),
        return_type=List[conlist(float, min_length=3, max_length=3)],  # type: ignore
    ),
]

# Pydantic type to serialize astropy SkyCoord objects as a list
# of vectors with no units
AstropyUnitVector = Annotated[
    SkyCoord,
    PlainSerializer(
        lambda x: x.cartesian.xyz.value.T.tolist(),
        return_type=List[conlist(float, min_length=3, max_length=3)],  # type: ignore
    ),
]


# Define a Pydantic type for astropy Latitude, Longitude and Quantity list-type
# objects, which will be serialized as a list of float in units of degrees.
AstropyDegrees = Annotated[
    Union[Latitude, Longitude, u.Quantity],
    PlainSerializer(
        lambda x: (
            x.deg.tolist() if type(x) is not u.Quantity else x.to(u.deg).value.tolist()
        ),
        return_type=List[float],
    ),
]

# Pydantic type for a Astropy Time  in seconds
AstropySeconds = Annotated[
    u.Quantity,
    PlainSerializer(
        lambda x: x.to(u.s).value,
        return_type=float,
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
    """
    Schema that defines date range

    Parameters
    ----------
    begin
        The start date of the range.
    end
        The end date of the range.

    Returns
    -------
    data
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
        assert data.begin <= data.end, "End date should not be before begin"
        return data


class EphemSchema(BaseSchema):
    """
    Schema for ephemeris data.
    """

    timestamp: AstropyTimeList
    posvec: AstropyPositionVector
    earthsize: AstropyDegrees
    velvec: AstropyVelocityVector
    sun: AstropyPositionVector
    moon: AstropyPositionVector
    latitude: AstropyDegrees
    longitude: AstropyDegrees
    stepsize: AstropySeconds


class EphemGetSchema(DateRangeSchema):
    """Schema to define required parameters for a GET

    Parameters
    ----------
    stepsize
        The step size in seconds

    """

    stepsize: AstropySeconds
    ...


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
    def find_tles_between_epochs(
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

    def write(self) -> None:
        """Write the TLE entry to the database."""
        table = tables.table(self.__tablename__)
        table.put_item(Item=self.model_dump(mode="json"))

    @property
    def io(self) -> IO:
        """
        Return the file handle for the TLE database.
        """
        tletext = f"{self.satname}\n{self.tle1}\n{self.tle2}\n"
        return io.BytesIO(tletext.encode())


class TLESchema(BaseSchema):
    tle: Optional[TLEEntry]


class SAAEntry(DateRangeSchema):
    """
    Simple class to hold a single SAA passage.

    Parameters
    ----------
    begin
        The start datetime of the SAA passage.
    end
        The end datetime of the SAA passage.
    """

    @property
    def length(self) -> u.Quantity:
        """
        Calculate the length of the SAA passage in days.

        Returns
        -------
            The length of the SAA passage
        """
        return self.end - self.begin


class SAASchema(BaseSchema):
    """
    Returns from the SAA class

    Parameters
    ----------
    entries
        List of SAAEntry objects.
    """

    entries: List[SAAEntry]


class SAAGetSchema(DateRangeSchema):
    """Schema defining required parameters for GET

    Inherits
    --------
    DateRangeSchema
        Schema for date range data.
    """

    ...
