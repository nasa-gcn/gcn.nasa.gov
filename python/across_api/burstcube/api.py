# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from ..base.api import EpochDep, app
from ..base.schema import TLESchema
from .tle import BurstCubeTLE


@app.get("/burstcube/tle")
def burstcube_tle(
    epoch: EpochDep,
) -> TLESchema:
    """
    Returns the best TLE for BurstCube for a given epoch.
    """
    return BurstCubeTLE(epoch=epoch).schema
