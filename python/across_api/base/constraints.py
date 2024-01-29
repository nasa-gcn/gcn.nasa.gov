from shapely import Polygon, points  # type: ignore
from astropy.time import Time  # type: ignore

from .ephem import EphemBase


class SAAPolygonConstraint:
    """
    Polygon based SAA constraint. The SAA is defined by a Shapely Polygon, and
    this constraint will calculate for a given ephemeris whether the spacecraft
    is in that SAA polygon.

    Attributes
    ----------
    polygon
        Shapely Polygon object defining the SAA polygon.

    """

    def __init__(self, polygon: Polygon):
        self.polygon = polygon

    def __call__(self, times: Time, ephem: EphemBase):
        """
        Return a bool array indicating whether the spacecraft is in constraint
        for a given ephemeris.

        Arguments
        ---------
        ephem
            The spacecraft ephemeris

        Returns
        -------
            Array of booleans for every timestamp in the calculated ephemeris
            returning True if the spacecraft is in the SAA polygon at that time.
        """
        # Find a slice what the part of the ephemeris that we're using
        i = slice(ephem.ephindex(times[0]), ephem.ephindex(times[-1]))

        # Return boolean array for when we're inside the SAA polygon
        return self.polygon.contains(points(ephem.longitude[i], ephem.latitude[i]))
