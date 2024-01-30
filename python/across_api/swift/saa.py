# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from typing import Optional

import astropy.units as u  # type: ignore
from astropy.time import Time  # type: ignore

from ..base.common import ceil_time, floor_time, round_time
from ..base.constraints import SAAPolygonConstraint  # type: ignore
from ..base.saa import SAABase
from .ephem import SwiftEphem


class SwiftSAA(SAABase):
    """
    Class to calculate Swift SAA passages.
    """

    # Swift Spacecraft SAA polygon as supplied by Swift team.
    insaacons = SAAPolygonConstraint(
        polygon=[
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
    )

    def __init__(
        self,
        begin: Time,
        end: Time,
        ephem: Optional[SwiftEphem] = None,
        stepsize: u.Quantity = 60 * u.s,
    ):
        """
        Initialize the SAA class. Set up the Ephemeris if it's not given.
        """
        # Round start and end times to stepsize resolution
        self.begin = round_time(begin, stepsize)
        self.end = round_time(end, stepsize)
        self.stepsize = stepsize

        # Instantiate the ephem class here if not passed as an argument. By
        # default we'll calculate ephem for a whole day, to aide with caching.
        if ephem is None:
            ephem = SwiftEphem(
                begin=floor_time(self.begin, 1 * u.day),
                end=ceil_time(self.end, 1 * u.day),
                stepsize=self.stepsize,
            )
        self.ephem = ephem

        # Calculate the SAA entries
        super().__init__(
            begin=self.begin, end=self.end, ephem=self.ephem, stepsize=self.stepsize
        )
