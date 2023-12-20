from datetime import datetime, timedelta
from typing import Any, List, Optional, Union

import astropy.units as u  # type: ignore
import numpy as np
from astropy.constants import c, h  # type: ignore
from pydantic import BaseModel, ConfigDict, Field, computed_field, model_validator
from pydantic_core import Url

from ..functions import convert_to_dt


class BaseSchema(BaseModel):
    """
    Base class for schemas.

    This class provides a base implementation for schemas and defines the `from_attributes` method.
    Subclasses can inherit from this class and override the `from_attributes` method to define their own schema logic.
    """

    model_config = ConfigDict(from_attributes=True)


class CoordSchema(BaseSchema):
    """Schema that defines basic RA/Dec

    Parameters
    ----------
    ra
        Right Ascension value in degrees. Must be 0 or greater
        and lower than 360.
    dec
        Declination value in degrees. Must be between -90 and 90.
    """

    ra: float = Field(ge=0, lt=360)
    dec: float = Field(ge=-90, le=90)


class PositionSchema(CoordSchema):
    """
    Schema for representing position information with an error radius.

    Attributes
    ----------
    error
        The error associated with the position. Defaults to None.
    """

    error: Optional[float] = None


class OptionalCoordSchema(BaseSchema):
    """Schema that defines basic RA/Dec

    Parameters
    ----------
    ra
        Right Ascension value in degrees. Must be between 0 and 360.
    dec
        Declination value in degrees. Must be between -90 and 90.

    Methods
    -------
    check_ra_dec(data: Any) -> Any
        Validates that RA and Dec are both set or both not set.

    """

    ra: Optional[float] = Field(ge=0, lt=360, default=None)
    dec: Optional[float] = Field(ge=-90, le=90, default=None)

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

        Raises
        ------
        AssertionError
            If RA and Dec are not both set or both not set.

        """
        if data.ra is None or data.dec is None:
            assert data.ra == data.dec, "RA/Dec should both be set, or both not set"
        return data


class OptionalPositionSchema(OptionalCoordSchema):
    """
    Schema for representing position information with an error radius.

    Attributes
    ----------
    error
        The error associated with the position. Defaults to None.
    """

    error: Optional[float] = None


class DateRangeSchema(BaseSchema):
    """Schema that defines date range

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

    begin: datetime
    end: datetime

    @model_validator(mode="after")
    @classmethod
    def check_dates(cls, data: Any) -> Any:
        data.end = convert_to_dt(data.end)
        data.begin = convert_to_dt(data.begin)
        assert data.begin <= data.end, "End date should not be before begin"
        return data


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

    begin: Optional[datetime] = None
    end: Optional[datetime] = None

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

        Raises
        ------
        AssertionError
            If the begin and end dates are not both set or both not set.
            If the end date is before the begin date.

        """
        if data.begin is None or data.end is None:
            assert (
                data.begin == data.end
            ), "Begin/End should both be set, or both not set"
        else:
            data.end = convert_to_dt(data.end)
            data.begin = convert_to_dt(data.begin)
        if data.begin != data.end:
            assert data.begin <= data.end, "End date should not be before begin"

        return data


class UserSchema(BaseSchema):
    """
    Username/API key Schema for API calls that require authentication

    Parameters
    ----------
    username
        The username for authentication.
    api_key
        The API key for authentication.
    """

    username: str
    api_key: str


# Schema defining the API Job status
class JobInfo(BaseSchema):
    """ACROSS API Job status information

    Parameters
    ----------
    created
        The datetime when the job was created.
    expires
        The datetime when the job expires.
    warnings
        A list of warning messages associated with the job.

    Attributes
    ----------
    num_warnings
        The number of warnings associated with the job.

    Methods
    -------
    warning(warning)
        Add a warning to the list of warnings.

    """

    created: Optional[datetime] = None
    expires: Optional[datetime] = None
    warnings: List[str] = []

    @property
    def num_warnings(self):
        return len(self.warnings)

    def warning(self, warning):
        """Add a warning to the list of warnings"""
        if warning not in self.warnings:
            self.warnings.append(warning)


class VisWindow(DateRangeSchema):
    """
    Represents a visibility window.

    Parameters
    ----------
    begin
        The beginning of the window.
    end
        The end of the window.
    initial
        The main constraint that ends at the beginning of the window.
    final
        The main constraint that begins at the end of the window.
    """

    initial: str
    final: str


class VisibilitySchema(BaseSchema):
    """
    Schema for visibility classes.

    Parameters
    ----------
    entries: List[VisWindow]
        List of visibility windows.
    status: JobInfo
        Information about the job status.
    """

    entries: List[VisWindow]
    status: JobInfo


class VisibilityGetSchema(CoordSchema, DateRangeSchema):
    """
    Schema for getting visibility data.

    Parameters
    ----------
    stepsize
        The step size in seconds for the visibility data. Default is 60.

    Inherits
    --------
    CoordSchema
        Schema for coordinate data.
    DateRangeSchema
        Schema for date range data.
    """

    stepsize: int = 60


class TLEEntry(BaseSchema):
    """
    Represents a Two-Line Element (TLE) entry.

    Attributes
    ----------
    tle1
        The first line of the TLE.
    tle2
        The second line of the TLE.
    epoch:  datetime
        The epoch of the TLE, calculated from the TLE1 line.

    """

    tle1: str = Field(min_length=69, max_length=69)
    tle2: str = Field(min_length=69, max_length=69)

    @computed_field  # type: ignore
    @property
    def epoch(self) -> datetime:
        """Calculate Epoch of TLE"""
        tleepoch = self.tle1.split()[3]
        year, dayofyear = int(f"20{tleepoch[0:2]}"), float(tleepoch[2:])
        fracday, dayofyear = np.modf(dayofyear)
        epoch = datetime.fromordinal(
            datetime(year, 1, 1).toordinal() + int(dayofyear) - 1
        ) + timedelta(days=fracday)
        return epoch


class TLESchema(BaseSchema):
    """
    Schema for representing a Two-Line Element (TLE) entry.

    Attributes
    ----------
    tle
        The TLE entry object.
    """

    tle: TLEEntry


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
    def length(self) -> float:
        """
        Calculate the length of the SAA passage in days.

        Returns:
            float: The length of the SAA passage in days.
        """
        return (self.end - self.begin).total_seconds() / 86400


class SAASchema(BaseSchema):
    """
    Returns from the SAA class

    Parameters
    ----------
    entries
        List of SAAEntry objects.
    status
        JobInfo object representing the status.

    """

    entries: List[SAAEntry]
    status: JobInfo


class SAAGetSchema(DateRangeSchema):
    """Schema defining required parameters for GET

    Inherits
    --------
    DateRangeSchema
        Schema for date range data.
    """

    ...


# Pointing Schemas
class PointBase(OptionalCoordSchema):
    """
    Schema defining a spacecraft pointing

    Parameters
    ----------
    timestamp
        The timestamp of the pointing.
    roll
        The roll angle of the spacecraft.
    observing
        Indicates whether the spacecraft is observing.
    infov
        Flag indicating whether an object is in the instrument field of view,
        can be True/False or a numerical fraction for larger uncertainties.

    Inherits
    --------
    CoordSchema
        Schema for coordinate data.
    """

    timestamp: datetime
    roll: Optional[float] = None
    observing: bool
    infov: Union[bool, float, None] = None


class PointingSchemaBase(BaseSchema):
    entries: List[PointBase]


class PointingGetSchemaBase(DateRangeSchema):
    stepsize: int = 60


class EphemSchema(BaseSchema):
    """
    Schema for ephemeral data.

    Attributes
    ----------
    timestamp
        List of timestamps.
    posvec
        List of position vectors for the spacecraft in GCRS.
    earthsize
        List of the angular size of the Earth to the spacecraft.
    polevec
        List of orbit pole vectors, by default None.
    velvec
        List of spacecraft velocity vectors, by default None.
    sunvec
        List of sun vectors.
    moonvec
        List of moon vectors.
    latitude
        List of latitudes.
    longitude
        List of longitudes.
    stepsize
        Step size, by default 60.
    status
        Job information.
    """

    timestamp: List[datetime] = []
    posvec: List[List[float]]
    earthsize: List[float]
    polevec: Optional[List[List[float]]] = None
    velvec: Optional[List[List[float]]] = None
    sunvec: List[List[float]]
    moonvec: List[List[float]]
    latitude: List[float]
    longitude: List[float]
    stepsize: int = 60
    status: JobInfo


class EphemGetSchema(DateRangeSchema):
    """Schema to define required parameters for a GET

    Parameters
    ----------
    stepsize
        The step size in seconds (default is 60).

    """

    stepsize: int = 60
    ...


# Config Schema


class MissionSchema(BaseSchema):
    """
    Schema for representing mission information.

    Parameters
    ----------
    name
        The name of the mission.
    shortname
        The short name of the mission.
    agency
        The agency responsible for the mission.
    type
        The type of the mission.
    pi
        The principal investigator of the mission. Defaults to None.
    description
        A description of the mission.
    website
        The website URL of the mission.
    """

    name: str
    shortname: str
    agency: str
    type: str
    pi: Optional[str] = None
    description: str
    website: Url


class FOVOffsetSchema(BaseSchema):
    """
    Schema to define an angular and rotational offset from the spacecraft pointing direction for an instrument.
    Tip: Add these values to the spacecraft pointing to get the instrument pointing and position angle.

    Parameters
    ----------
    ra_off
        The angular offset in Right Ascension (RA) direction.
    dec_off
        The angular offset in Declination (Dec) direction.
    roll_off
        The rotational offset around the spacecraft pointing direction.

    """

    ra_off: float
    dec_off: float
    roll_off: float


class FOVSchema(BaseSchema):
    """
    FOVSchema represents the field of view (FOV) of an instrument.

    Attributes
    ----------
    type
        The type of the FOV. Currently "AllSky", "Circular", "Square" and "HEALPix" are supported.
    area
        The area of the FOV in degrees**2.
    dimension
        The dimension of the FOV.
    filename
        The filename associated with the FOV.
    boresight
        The boresight offset of the FOV.

    """

    type: str
    area: float  # degrees**2
    dimension: Optional[float]
    filename: Optional[str] = None
    boresight: Optional[FOVOffsetSchema] = None


class InstrumentSchema(BaseSchema):
    """
    Schema for representing an instrument.

    Attributes
    ----------
    name
        The name of the instrument.
    shortname
        The short name of the instrument.
    description
        The description of the instrument.
    website
        The website URL of the instrument.
    energy_low
        The low energy range of the instrument.
    energy_high
        The high energy range of the instrument.
    fov
        The field of view of the instrument.

    Properties
    ----------
    frequency_high
        The high frequency range of the instrument.
    frequency_low
        The low frequency range of the instrument.
    wavelength_high
        The high wavelength range of the instrument.
    wavelength_low
        The low wavelength range of the instrument.
    """

    name: str
    shortname: str
    description: str
    website: Url
    energy_low: float
    energy_high: float
    fov: FOVSchema

    @property
    def frequency_high(self) -> u.Quantity:
        return ((self.energy_high * u.keV) / h).to(u.Hz)  # type: ignore

    @property
    def frequency_low(self) -> u.Quantity:
        return ((self.energy_low * u.keV) / h).to(u.Hz)  # type: ignore

    @property
    def wavelength_high(self) -> u.Quantity:
        return c / self.frequency_low.to(u.nm)

    @property
    def wavelength_low(self) -> u.Quantity:
        return c / self.frequency_high.to(u.nm)


class EphemConfigSchema(BaseSchema):
    """
    Schema for configuring ephemeris properties.

    Parameters
    ----------
    parallax
        Flag indicating whether to include parallax when calculating Moon/Sun
        positions.
    apparent
        Flag indicating whether to use apparent rather than astrometric
        positions.
    velocity
        Flag indicating whether to include velocity calculation (needed for
        calculating pole or ram constraints).
    stepsize
        Step size in seconds. Default is 60.
    earth_radius
        Earth radius value. If None, it will be calculated. If float, it will
        be fixed to this value.
    """

    parallax: bool
    apparent: bool
    velocity: bool
    stepsize: int = 60
    earth_radius: Optional[
        float
    ] = None  # if None, calculate it, if float, fix to this value


class VisibilityConfigSchema(BaseSchema):
    """
    Schema for configuring visibility constraints.

    Attributes:
    earth_cons
        Calculate Earth Constraint.
    moon_cons
        Calculate Moon Constraint.
    sun_cons
        Calculate Sun Constraint.
    ram_cons
        Calculate Ram Constraint.
    pole_cons
        Calculate Orbit Pole Constraint.
    saa_cons
        Calculate time in SAA as a constraint.
    earthoccult
        How many degrees from Earth Limb can you look?
    moonoccult
        Degrees from center of Moon.
    sunoccult
        Degrees from center of Sun.
    ramsize
        Degrees from center of ram direction. Defaults to 0.
    sunextra
        Degrees buffer used for planning purpose. Defaults to 0.
    earthextra
        Degrees buffer used for planning purpose. Defaults to 0.
    moonextra
        Degrees buffer used for planning purpose. Defaults to 0.
    ramextra
        Degrees buffer used for planning purpose. Defaults to 0.
    """

    # Constraint switches, set to True to calculate this constraint
    earth_cons: bool
    moon_cons: bool
    sun_cons: bool
    ram_cons: bool
    pole_cons: bool
    saa_cons: bool
    # Constraint avoidance values
    earthoccult: float
    moonoccult: float
    sunoccult: float
    ramsize: float = 0
    # Extra degrees buffer used for planning purpose
    sunextra: float = 0
    earthextra: float = 0
    moonextra: float = 0
    ramextra: float = 0


class TLEConfigSchema(BaseSchema):
    """
    Schema for TLE configuration.

    Parameters
    ----------
    tle_bad
        The threshold for determining if a TLE is considered bad in units
        of days. I.e. if the TLE is older than this value, it is considered
        bad.
    tle_url
        The URL for retrieving TLE data. Defaults to None.
    tle_name
        The name of the TLE.
    tle_heasarc
        The URL for retrieving TLE data from HEASARC in their multi-TLE format.
        Defaults to None.
    tle_celestrak
        The URL for retrieving TLE data from Celestrak. Defaults to None.
    """

    tle_bad: float
    tle_url: Optional[Url] = None
    tle_name: str
    tle_heasarc: Optional[Url] = None
    tle_celestrak: Optional[Url] = None


class ConfigSchema(BaseSchema):
    """
    Configuration schema for ACROSS API.

    Parameters
    ----------
    mission
        The mission schema.
    instruments
        The list of instrument schemas.
    primary_instrument
        The index of the primary instrument, defaults to 0.
    ephem
        The ephem configuration schema.
    visibility
        The visibility configuration schema.
    tle
        The TLE configuration schema.
    """

    mission: MissionSchema
    instruments: List[InstrumentSchema]
    primary_instrument: int = 0
    ephem: EphemConfigSchema
    visibility: VisibilityConfigSchema
    tle: TLEConfigSchema
