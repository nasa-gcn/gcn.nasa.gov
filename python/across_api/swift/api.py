# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from ..base.api import DateRangeDep, EpochDep, StepSizeDep, app
from ..base.schema import EphemSchema, TLESchema
from .ephem import SwiftEphem
from .tle import SwiftTLE


@app.get("/swift/ephem")
def swift_ephemeris(
    daterange: DateRangeDep,
    stepsize: StepSizeDep,
) -> EphemSchema:
    """
    Calculates the ephemeris for Swift.
    """
    return SwiftEphem(
        begin=daterange["begin"], end=daterange["end"], stepsize=stepsize
    ).schema


@app.get("/swift/tle")
def swift_tle(
    epoch: EpochDep,
) -> TLESchema:
    """
    Returns the best TLE for Swift for a given epoch.
    """
    return SwiftTLE(epoch=epoch).schema
