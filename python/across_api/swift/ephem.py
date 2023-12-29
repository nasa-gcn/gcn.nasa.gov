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

    # Configuration options
    parallax = True  # Calculate parallax for Moon/Sun
    apparent = True  # Use apparent positions
    velocity = True  # Calculate Velocity of spacecraft (slower)
    earth_radius = None  # Calculate Earth radius
    tleclass = SwiftTLE
