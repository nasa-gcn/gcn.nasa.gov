# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

import os

from ..base.api import DateRangeDep, EpochDep, StepSizeDep, app
from ..base.schema import EphemSchema, SAASchema, TLESchema
from .ephem import SwiftEphem
from .saa import SwiftSAA
from .tle import SwiftTLE

if os.environ.get("ARC_ENV") == "testing":

    @app.get("/testing/swift/ephem")
    async def swift_ephem(
        date_range: DateRangeDep, stepsize: StepSizeDep
    ) -> EphemSchema:
        """
        Returns the best TLE for Swift for a given epoch.
        """
        return SwiftEphem(
            begin=date_range["begin"], end=date_range["end"], stepsize=stepsize
        ).schema

    @app.get("/testing/swift/tle")
    async def swift_tle(
        epoch: EpochDep,
    ) -> TLESchema:
        """
        Returns the best TLE for Swift for a given epoch.
        """
        return SwiftTLE(epoch=epoch).schema

    @app.get("/testing/swift/saa")
    async def swift_saa(date_range: DateRangeDep, stepsize: StepSizeDep) -> SAASchema:
        """
        Returns the best TLE for Swift for a given epoch.
        """
        return SwiftSAA(
            begin=date_range["begin"], end=date_range["end"], stepsize=stepsize
        ).schema
