# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from datetime import datetime
from typing import Annotated, Optional

import astropy.units as u  # type: ignore[import]
from astropy.time import Time  # type: ignore[import]
from fastapi import Depends, Path, Query


# Depends functions for FastAPI calls.
async def optional_daterange(
    begin: Annotated[
        Optional[datetime],
        Query(
            description="Start time of period to be calculated.",
            title="Begin",
        ),
    ] = None,
    end: Annotated[
        Optional[datetime],
        Query(
            description="Start time of period to be calculated.",
            title="End",
        ),
    ] = None,
) -> dict:
    """
    Helper function to convert begin and end to datetime objects.
    """
    if begin is None or end is None:
        return {"begin": None, "end": None}
    return {"begin": Time(begin), "end": Time(end)}


OptionalDateRangeDep = Annotated[dict, Depends(optional_daterange)]


# Depends functions for FastAPI calls.
async def optional_duration(
    duration: Annotated[
        Optional[float],
        Query(
            description="Duration of time (days).",
            title="Duration",
        ),
    ] = None,
) -> Optional[u.Quantity[u.day]]:
    """
    Helper function to convert a float duration in days to a u.Quantity
    """
    if duration is None:
        return None
    return duration * u.day


OptionalDurationDep = Annotated[dict, Depends(optional_duration)]


async def optional_limit(
    limit: Annotated[
        Optional[int],
        Query(
            ge=0,
            title="Limit",
            description="Maximum number of results to return.",
        ),
    ] = None,
) -> Optional[int]:
    return limit


LimitDep = Annotated[Optional[int], Depends(optional_limit)]


async def error_radius(
    error_radius: Annotated[
        Optional[float],
        Query(
            ge=0,
            title="Error Radius",
            description="Error radius in degrees.",
        ),
    ] = None,
) -> Optional[u.Quantity[u.deg]]:
    if error_radius is None:
        return None
    return error_radius * u.deg


ErrorRadiusDep = Annotated[float, Depends(error_radius)]


async def exposure(
    exposure: Annotated[
        float,
        Query(
            ge=0,
            title="Exposure",
            description="Exposure time in seconds.",
        ),
    ] = 200,
) -> u.Quantity[u.s]:
    return exposure * u.s


ExposureDep = Annotated[float, Depends(exposure)]


async def offset(
    offset: Annotated[
        float,
        Query(
            ge=-200,
            le=200,
            title="Offset",
            description="Offset start of dump window from T0 by this amount (seconds).",
        ),
    ] = -50,
) -> u.Quantity[u.s]:
    return offset * u.s


OffsetDep = Annotated[float, Depends(offset)]


async def optional_ra_dec(
    ra: Annotated[
        Optional[float],
        Query(
            ge=0,
            lt=360,
            title="RA (J2000)",
            description="Right Ascenscion in J2000 coordinates and units of decimal degrees.",
        ),
    ] = None,
    dec: Annotated[
        Optional[float],
        Query(
            ge=-90,
            le=90,
            title="Dec (J2000)",
            description="Declination in J2000 coordinates in units of decimal degrees.",
        ),
    ] = None,
) -> Optional[dict]:
    if ra is None or dec is None:
        return {"ra": None, "dec": None}
    return {"ra": ra * u.deg, "dec": dec * u.deg}


OptionalRaDecDep = Annotated[dict, Depends(optional_ra_dec)]


IdDep = Annotated[str, Path(description="TOO ID string")]


async def trigger_time(
    trigger_time: Annotated[
        datetime,
        Query(
            title="Trigger Time",
            description="Time of trigger in UTC or ISO format.",
        ),
    ],
) -> Optional[Time]:
    return Time(trigger_time)


TriggerTimeDep = Annotated[datetime, Depends(trigger_time)]
