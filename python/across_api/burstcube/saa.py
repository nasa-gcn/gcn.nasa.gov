# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from typing import Optional

import astropy.units as u  # type: ignore
from astropy.time import Time  # type: ignore

from ..base.common import ceil_time, floor_time, round_time
from ..base.constraints import SAAPolygonConstraint  # type: ignore
from ..base.saa import SAABase
from .ephem import BurstCubeEphem


class BurstCubeSAA(SAABase):
    """
    Class to calculate BurstCube SAA passages.
    """

    # BurstCube Spacecraft SAA polygon as supplied by BurstCube team.
    insaacons = SAAPolygonConstraint(
        polygon=[
            (33.900000, -30.0),
            (12.398, -19.876),
            (-9.103, -9.733),
            (-30.605, 0.4),
            (-38.4, 2.0),
            (-45.0, 2.0),
            (-65.0, -1.0),
            (-84.0, -6.155),
            (-89.2, -8.880),
            (-94.3, -14.220),
            (-94.3, -18.404),
            (-84.48631, -31.84889),
            (-86.100000, -30.0),
            (-72.34921, -43.98599),
            (-54.5587, -52.5815),
            (-28.1917, -53.6258),
            (-0.2095279, -46.88834),
            (28.8026, -34.0359),
            (33.900000, -30.0),
        ]
    )

    def __init__(
        self,
        begin: Time,
        end: Time,
        ephem: Optional[BurstCubeEphem] = None,
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
            ephem = BurstCubeEphem(
                begin=floor_time(self.begin, 1 * u.day),
                end=ceil_time(self.end, 1 * u.day),
                stepsize=self.stepsize,
            )
        self.ephem = ephem

        # Calculate the SAA entries
        super().__init__(
            begin=self.begin, end=self.end, ephem=self.ephem, stepsize=self.stepsize
        )
