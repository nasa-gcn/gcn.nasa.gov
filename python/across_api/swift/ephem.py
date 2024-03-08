# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from cachetools import TTLCache, cached

from ..base.common import ACROSSAPIBase
from ..base.ephem import EphemBase
from .tle import SwiftTLE


@cached(cache=TTLCache(maxsize=128, ttl=86400))
class SwiftEphem(EphemBase, ACROSSAPIBase):
    """
    Class to generate Swift ephemeris. Generate on the fly an ephemeris for
    Satellite from TLE.
    """

    async def get(self) -> bool:
        if self.tle is None:
            # Get TLE
            tle = SwiftTLE(self.begin)
            await tle.get()
            self.tle = tle.tle

        # Compute ephemeris
        self.compute_ephem()
        return True
