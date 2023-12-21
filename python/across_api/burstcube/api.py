from datetime import datetime, timezone
from typing import Annotated, Optional

from fastapi import Depends, Query

from ..base.api import app
from ..base.schema import TLESchema
from .tle import BurstCubeTLE


def to_naive_utc(value: datetime) -> datetime:
    """
    Converts a datetime object to a naive datetime object in UTC timezone.

    Arguments
    ---------
    value
        The datetime object to be converted.

    Returns
    -------
        The converted naive datetime object in UTC timezone.
    """
    return value.astimezone(tz=timezone.utc).replace(tzinfo=None)


async def epoch(
    epoch: Annotated[
        datetime,
        Query(
            title="Epoch",
            description="Epoch in UTC or ISO format.",
        ),
    ],
) -> Optional[datetime]:
    return to_naive_utc(epoch)


EpochDep = Annotated[datetime, Depends(epoch)]


@app.get("/burstcube/tle")
async def burstcube_tle(
    epoch: EpochDep,
) -> TLESchema:
    """
    Returns the best TLE for BurstCube for a given epoch.
    """
    tle = BurstCubeTLE(epoch=epoch)
    return tle.schema
