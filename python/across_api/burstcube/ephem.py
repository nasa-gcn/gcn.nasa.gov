from astropy.time import Time  # type: ignore
from cachetools import TTLCache, cached

from ..base.common import ACROSSAPIBase
from ..base.ephem import EphemBase
from .tle import BurstCubeTLE


@cached(cache=TTLCache(maxsize=1024, ttl=86400))
class BurstCubeEphem(EphemBase, ACROSSAPIBase):
    """
    Class to generate BurstCube ephemeris. Generate on the fly an ephemeris for Satellite from TLE.
    """

    # Configuration options
    velocity = False
    parallax = False  # Calculate parallax for Moon/Sun
    apparent = True  # Use apparent positions
    velocity = False  # Calculate Velocity of spacecraft (slower)
    earth_radius = 70  # Fix 70 degree Earth radius

    def __init__(self, begin: Time, end: Time, stepsize: int = 60):
        # Default values
        self.tle = BurstCubeTLE(begin).tle

        # Parse argument keywords
        self.begin = begin
        self.end = end
        self.stepsize = stepsize

        # Validate and process API call
        if self.validate_get():
            # Perform GET
            self.get()
