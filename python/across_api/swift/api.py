# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from ..base.api import DateRangeDep, EpochDep, StepSizeDep, app
from ..base.schema import SAASchema, TLESchema
from .saa import SwiftSAA
from .tle import SwiftTLE


@app.get("/swift/saa")
async def swift_saa(
    daterange: DateRangeDep,
    stepsize: StepSizeDep,
) -> SAASchema:
    """
    Endpoint for retrieving the times of Swift SAA passages for a given date range.
    """
    return SwiftSAA(stepsize=stepsize, **daterange).schema


@app.get("/swift/tle")
def swift_tle(
    epoch: EpochDep,
) -> TLESchema:
    """
    Returns the best TLE for Swift for a given epoch.
    """
    return SwiftTLE(epoch=epoch).schema
