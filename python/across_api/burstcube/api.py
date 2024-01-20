# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from ..base.api import DateRangeDep, EpochDep, StepSizeDep, app
from ..base.schema import EphemSchema, TLESchema
from .ephem import BurstCubeEphem
from .tle import BurstCubeTLE


@app.get("/burstcube/ephem")
def burstcube_ephemeris(
    daterange: DateRangeDep,
    stepsize: StepSizeDep,
) -> EphemSchema:
    """
    Calculates the ephemeris for BurstCube.
    """
    return BurstCubeEphem(
        begin=daterange["begin"], end=daterange["end"], stepsize=stepsize
    ).schema


@app.get("/burstcube/tle")
def burstcube_tle(
    epoch: EpochDep,
) -> TLESchema:
    """
    Returns the best TLE for BurstCube for a given epoch.
    """
    return BurstCubeTLE(epoch=epoch).schema
