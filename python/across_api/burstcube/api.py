# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from ..base.api import DateRangeDep, EpochDep, StepSizeDep, app
from ..base.schema import SAASchema, TLESchema
from .saa import BurstCubeSAA
from .tle import BurstCubeTLE


@app.get("/burstcube/saa")
async def burstcube_saa(
    daterange: DateRangeDep,
    stepsize: StepSizeDep,
) -> SAASchema:
    """
    Endpoint to retrieve BurstCubeSAA data for a given date range and step size.
    """
    return BurstCubeSAA(stepsize=stepsize, **daterange).schema


@app.get("/burstcube/tle")
def burstcube_tle(
    epoch: EpochDep,
) -> TLESchema:
    """
    Returns the best TLE for BurstCube for a given epoch.
    """
    return BurstCubeTLE(epoch=epoch).schema
