# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

import astropy.units as u  # type: ignore
import numpy as np  # type: ignore
from astropy.time import Time  # type: ignore
from shapely.geometry import Polygon  # type: ignore

from across_api.base.common import round_time  # type: ignore

from ..base.saa import SAABase, SAAPolygonBase
from .ephem import SwiftEphem


class SwiftSAAPolygon(SAAPolygonBase):
    """Class to define the Swift SAA polygon.

    Attributes
    ----------
    points : list
        List of points defining the SAA polygon.
    saapoly : Polygon
        Shapely Polygon object defining the SAA polygon.
    bat_points : list
        List of points defining the BAT SAA polygon.
    bat_saapoly : Polygon
        Shapely Polygon object defining the BAT SAA polygon.
    """

    def __init__(self):
        # Spacecraft SAA polygon
        points = [
            (39.0, -30.0),
            (36.0, -26.0),
            (28.0, -21.0),
            (6.0, -12.0),
            (-5.0, -6.0),
            (-21.0, 2.0),
            (-30.0, 3.0),
            (-45.0, 2.0),
            (-60.0, -2.0),
            (-75.0, -7.0),
            (-83.0, -10.0),
            (-87.0, -16.0),
            (-86.0, -23.0),
            (-83.0, -30.0),
        ]
        self.saapoly = Polygon(points)


class SwiftSAA(SAABase):
    """
    Class to calculate Swift SAA passages.
    """

    saa = SwiftSAAPolygon()
    ephemclass = SwiftEphem

    def __init__(self, begin, end, ephem=None, stepsize=60 * u.s):
        """
        Initialize the SAA class. Set up the Ephemeris if it's not given.
        """
        # Round start and end times to stepsize, create array of timestamps
        self.begin = round_time(begin, stepsize)
        self.end = round_time(end, stepsize)
        self.stepsize = stepsize
        steps = int((self.end - self.begin).to(u.s) / (self.stepsize.to(u.s)) + 1)
        self.timestamp = Time(np.linspace(self.begin, self.end, steps))

        # Need to instantiate the ephem class here or else th
        if ephem is None:
            ephem = SwiftEphem(begin=self.begin, end=self.end, stepsize=self.stepsize)
        self.ephem = ephem

        # Calculate the SAA entries
        super().__init__(
            begin=self.begin, end=self.end, ephem=self.ephem, stepsize=self.stepsize
        )
