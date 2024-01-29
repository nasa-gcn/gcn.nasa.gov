# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from ..base.api import EpochDep, app
from ..base.schema import TLESchema
from .tle import SwiftTLE


@app.get("/swift/tle")
def swift_tle(
    epoch: EpochDep,
) -> TLESchema:
    """
    Returns the best TLE for Swift for a given epoch.
    """
    return SwiftTLE(epoch=epoch).schema
