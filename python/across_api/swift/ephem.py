# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from typing import Optional
import astropy.units as u  # type: ignore
from astropy.time import Time  # type: ignore
from cachetools import TTLCache, cached

from ..base.common import ACROSSAPIBase
from ..base.ephem import EphemBase
from ..base.schema import TLEEntry
from .tle import SwiftTLE


@cached(cache=TTLCache(maxsize=128, ttl=86400))
class SwiftEphem(EphemBase, ACROSSAPIBase):
    """
    Class to generate Swift ephemeris. Generate on the fly an ephemeris for
    Satellite from TLE.
    """

    def __init__(
        self,
        begin: Time,
        end: Time,
        stepsize: u.Quantity = 60 * u.s,
        tle: Optional[TLEEntry] = None,
    ):
        # Load TLE data
        self.tle = tle
        if self.tle is None:
            self.tle = SwiftTLE(begin).tle
        if self.tle is not None:
            super().__init__(begin=begin, end=end, stepsize=stepsize)
