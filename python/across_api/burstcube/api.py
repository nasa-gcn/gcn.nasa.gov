# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from .ephem import BurstCubeEphem
from .saa import BurstCubeSAA
from ..base.api import DateRangeDep, EpochDep, StepSizeDep, app
from ..base.schema import EphemGetSchema, SAASchema, TLESchema
from .tle import BurstCubeTLE
import os

if os.environ.get("ARC_ENV") == "testing":

    @app.get("/testing/burstcube/ephem")
    async def burstcube_ephem(
        date_range: DateRangeDep, stepsize: StepSizeDep
    ) -> EphemGetSchema:
        """
        Returns the best TLE for BurstCube for a given epoch.
        """
        return BurstCubeEphem(
            begin=date_range["begin"], end=date_range["end"], stepsize=stepsize
        ).schema

    @app.get("/testing/burstcube/tle")
    async def burstcube_tle(
        epoch: EpochDep,
    ) -> TLESchema:
        """
        Returns the best TLE for BurstCube for a given epoch.
        """
        return BurstCubeTLE(epoch=epoch).schema

    @app.get("/testing/burstcube/saa")
    async def burstcube_saa(
        date_range: DateRangeDep, stepsize: StepSizeDep
    ) -> SAASchema:
        """
        Returns the SAA entries for BurstCube for a given time range.
        """
        return BurstCubeSAA(
            begin=date_range["begin"], end=date_range["end"], stepsize=stepsize
        ).schema
