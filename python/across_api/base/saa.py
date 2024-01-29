# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.


from typing import List, Optional

import astropy.units as u  # type: ignore
from astropy.time import Time  # type: ignore
from shapely import Polygon  # type: ignore

from .constraints import SAAPolygonConstraint

from .common import ACROSSAPIBase, round_time
from .ephem import EphemBase
from .schema import SAAEntry, SAAGetSchema, SAASchema
from .window import MakeWindowBase
import numpy as np


class SAAPolygonBase:
    """
    Class to define the Mission SAA Polygon.

    Attributes
    ----------
    points
        List of points defining the SAA polygon.
    saapoly
        Shapely Polygon object defining the SAA polygon.

    """

    saapoly: Polygon = [
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


class SAABase(ACROSSAPIBase, MakeWindowBase):
    """
    Class for SAA calculations.

    Parameters
    ----------
    begin
        Start time of SAA search
    end
        End time of SAA search
    ephem
        Ephem object to use for SAA calculations (optional, calculated if not
        provided)
    stepsize
        Step size for SAA calculations

    Attributes
    ----------
    saa
        SAA Polygon object to use for SAA calculations
    ephem
        Ephem object to use for SAA calculations
    entries
        List of SAA entries
    status
        Status of SAA query
    """

    _schema = SAASchema
    _get_schema = SAAGetSchema

    begin: Time
    end: Time
    timestamp: Time

    # Internal things
    saa: SAAPolygonBase

    stepsize: u.Quantity
    entries: List[SAAEntry]  # type: ignore

    def __init__(
        self,
        begin: Time,
        end: Time,
        ephem: Optional[EphemBase] = None,
        stepsize: u.Quantity = 60 * u.s,
    ):
        """
        Initialize the SAA class.
        """
        # Parse parameters
        self.begin = round_time(begin, stepsize)
        self.end = round_time(end, stepsize)
        self.stepsize = stepsize
        if ephem is not None:
            self.ephem = ephem
            # Make sure stepsize matches supplied ephemeris
            self.stepsize = ephem.stepsize

        # Set up SAA polygon
        self.saacons = SAAPolygonConstraint(self.saa.saapoly)

        # If request validates, do a get
        if self.validate_get():
            self.get()

    def get(self) -> bool:
        """
        Calculate list of SAA entries for a given date range.

        Returns
        -------
            Did the query succeed?
        # Determine the times to calculate the SAA
        steps = (self.end - self.begin).to(u.s) / (self.stepsize.to(u.s)) + 1
        self.timestamp = Time(np.linspace(self.begin, self.end, steps))

        """
        # Calculate SAA windows
        self.entries = self.make_windows(
            np.logical_not(self.saacons(times=self.timestamp, ephem=self.ephem)),
            wintype=SAAEntry,
        )

        return True

    def insaawindow(self, t):
        """
        Check if the given Time falls within any of the SAA windows in list.

        Arguments
        ---------
        t
            The Time to check.

        Returns
        -------
            True if the Time falls within any SAA window, False otherwise.
        """
        return True in [True for win in self.entries if t >= win.begin and t <= win.end]

    @classmethod
    def insaa(cls, t: Time) -> bool:
        """
        For a given time, are we in the SAA?

        Parameters
        ----------
        dttime
            Time at which to calculate if we're in SAA

        Returns
        -------
            True if we're in the SAA, False otherwise
        """
        # Calculate an ephemeris for the exact time requested
        cls.saacons = SAAPolygonConstraint(cls.saa.saapoly)
        ephem = cls.ephemclass(begin=t, end=t, stepsize=1e-6 * u.s)  # type: ignore
        return cls.saacons(times=t, ephem=ephem)[0]
