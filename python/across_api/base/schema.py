from datetime import datetime, timedelta
from typing import Any, List, Optional, Union

import astropy.units as u  # type: ignore
import numpy as np
from astropy.constants import c, h  # type: ignore
from pydantic import BaseModel, ConfigDict, Field, computed_field, model_validator
from pydantic_core import Url

from ..functions import convert_to_dt


class BaseSchema(BaseModel):
    """Just define from_attributes for every Schema"""

    model_config = ConfigDict(from_attributes=True)


class CoordSchema(BaseSchema):
    """Schema that defines basic RA/Dec"""

    ra: float = Field(ge=0, lt=360)
    dec: float = Field(ge=-90, le=90)


class PositionSchema(CoordSchema):
    error: Optional[float] = None


class OptionalCoordSchema(BaseSchema):
    """Schema that defines basic RA/Dec"""

    ra: Optional[float] = Field(ge=0, lt=360, default=None)
    dec: Optional[float] = Field(ge=-90, le=90, default=None)

    @model_validator(mode="after")
    @classmethod
    def check_ra_dec(cls, data: Any) -> Any:
        if data.ra is None or data.dec is None:
            assert data.ra == data.dec, "RA/Dec should both be set, or both not set"
        return data


class DateRangeSchema(BaseSchema):
    """Schema that defines date range"""

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
    """Schema that defines date range, which is optional"""

    begin: Optional[datetime] = None
    end: Optional[datetime] = None

    @model_validator(mode="after")
    @classmethod
    def check_dates(cls, data: Any) -> Any:
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
    """Username/API key Schema for API calls that require authentication"""

    username: str
    api_key: str


# Schema defining the API Job status
class JobInfo(BaseSchema):
    """ACROSS API Job status information"""

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


# Schema for Visibility Classes
class VisWindow(DateRangeSchema):
    initial: str
    final: str


class VisibilitySchema(BaseSchema):
    entries: List[VisWindow]
    status: JobInfo


class VisibilityGetSchema(CoordSchema, DateRangeSchema):
    stepsize: int = 60


# Schema for TLE Class
class TLEEntry(BaseSchema):
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
    tle: TLEEntry


# SAA Schema
class SAAEntry(DateRangeSchema):
    """Simple class to hold a single SAA passage"""

    @property
    def length(self) -> float:
        return (self.end - self.begin).total_seconds() / 86400


class SAASchema(BaseSchema):
    """Returns from thee SAA class"""

    entries: List[SAAEntry]
    status: JobInfo


class SAAGetSchema(DateRangeSchema):
    """Schema defining required parameters for GET"""

    pass


# Pointing Schemas
class PointBase(BaseSchema):
    """Schema defining a spacecraft pointing"""

    time: datetime
    ra: Optional[float] = None
    dec: Optional[float] = None
    roll: Optional[float] = None
    observing: bool
    infov: Union[bool, float, None] = None


class PointingSchemaBase(BaseSchema):
    entries: List[PointBase]


class PointingGetSchemaBase(DateRangeSchema):
    stepsize: int = 60


# Plan Schema
class PlanEntryBase(DateRangeSchema, CoordSchema):
    targname: str
    exposure: int


class PlanGetSchemaBase(OptionalDateRangeSchema, OptionalCoordSchema):
    obsid: Union[str, int, None] = None
    radius: Optional[float] = None


class PlanSchemaBase(BaseSchema):
    entries: List[PlanEntryBase]
    status: Optional[JobInfo] = None


# Ephem Schema


class EphemSchema(BaseSchema):
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
    """Schema to define required parameters for a GET"""

    stepsize: int = 60
    pass


# Config Schema


class MissionSchema(BaseSchema):
    name: str
    shortname: str
    agency: str
    type: str
    pi: Optional[str] = None
    description: str
    website: Url


class FOVOffsetSchema(BaseSchema):
    """Schema to define an angular and rotational offset from the spacecraft pointing direction for an instrument.
    Tip: Add these values to the spacecraft pointing to get the instrument pointing and position angle.
    """

    ra_off: float
    dec_off: float
    roll_off: float


class FOVSchema(BaseSchema):
    type: str
    area: float  # degrees**2
    dimension: Optional[float]
    filename: Optional[str] = None
    boresight: Optional[FOVOffsetSchema] = None


class InstrumentSchema(BaseSchema):
    name: str
    shortname: str
    description: str
    website: Url
    energy_low: float
    energy_high: float
    fov: FOVSchema

    @property
    def frequency_high(self):
        return ((self.energy_high * u.keV) / h).to(u.Hz)  # type: ignore

    @property
    def frequency_low(self):
        return ((self.energy_low * u.keV) / h).to(u.Hz)  # type: ignore

    @property
    def wavelength_high(self):
        return c / self.frequency_low.to(u.nm)

    @property
    def wavelength_low(self):
        return c / self.frequency_high.to(u.nm)


class EphemConfigSchema(BaseSchema):
    parallax: bool
    apparent: bool
    velocity: bool
    stepsize: int = 60
    earth_radius: Optional[
        float
    ] = None  # if None, calculate it, if float, fix to this value


class VisibilityConfigSchema(BaseSchema):
    # Constraint switches, set to True to calculate this constraint
    earth_cons: bool  # Calculate Earth Constraint
    moon_cons: bool  # Calculate Moon Constraint
    sun_cons: bool  # Calculate Sun Constraint
    ram_cons: bool  # Calculate Ram Constraint
    pole_cons: bool  # Calcualte Orbit Pole Constraint
    saa_cons: bool  # Calculate time in SAA as a constraint
    # Constraint avoidance values
    earthoccult: float  # How many degrees from Earth Limb can you look?
    moonoccult: float  # degrees from center of Moon
    sunoccult: float  # degrees from center of Sun
    ramsize: float = 0  # degrees from center of ram direction
    sunextra: float = 0  # degrees buffer used for planning purpose
    earthextra: float = 0  # degrees buffer used for planning purpose
    moonextra: float = 0  # degrees buffer used for planning purpose
    ramextra: float = 0  # degrees buffer used for planning purpose


class TLEConfigSchema(BaseSchema):
    tle_bad: float
    tle_url: Optional[Url] = None
    tle_name: str
    tle_heasarc: Optional[Url] = None
    tle_celestrak: Optional[Url] = None


class ConfigSchema(BaseSchema):
    mission: MissionSchema
    instruments: List[InstrumentSchema]
    primary_instrument: int = 0
    ephem: EphemConfigSchema
    visibility: VisibilityConfigSchema
    tle: TLEConfigSchema
