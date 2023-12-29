from astropy.time import Time  # type: ignore
from cachetools import TTLCache, cached

from ..base.common import ACROSSAPIBase
from ..base.ephem import EphemBase
from .tle import SwiftTLE


@cached(cache=TTLCache(maxsize=1024, ttl=86400))
class SwiftEphem(EphemBase, ACROSSAPIBase):
    """
    Class to generate Swift ephemeris. Generate on the fly an ephemeris for Satellite from TLE.
    """

    # Configuration options
    parallax = True  # Calculate parallax for Moon/Sun
    apparent = True  # Use apparent positions
    velocity = True  # Calculate Velocity of spacecraft (slower)

    def __init__(self, begin: Time, end: Time, stepsize: int = 60):
        # Default values
        self.tle = SwiftTLE(begin).tle

        # Parse argument keywords
        self.begin = begin
        self.end = end
        self.stepsize = stepsize

        # Validate and process API call
        if self.validate_get():
            # Perform GET
            self.get()
