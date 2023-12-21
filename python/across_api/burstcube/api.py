from datetime import datetime
from typing import Annotated, Optional

from fastapi import Depends, Query

from ..base.schema import TLESchema

from .tle import BurstCubeTLE

from ..base.api import (
    app,
)
from ..functions import convert_to_dt


async def epoch(
    epoch: Annotated[
        datetime,
        Query(
            title="Epoch",
            description="Epoch in UTC or ISO format.",
        ),
    ],
) -> Optional[datetime]:
    return convert_to_dt(epoch)


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
