# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.


class PointingBase:
    """
    Defined class to represent an observation of an instrument

    TODO: Minimally defined for sake of BurstCube MVP
    """

    ra: float
    dec: float
    position_angle: float

    def __init__(self, ra, dec, position_angle) -> None:
        self.ra = ra
        self.dec = dec
        self.position_angle = position_angle
