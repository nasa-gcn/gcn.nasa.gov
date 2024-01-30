# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from ..base.constraints import EarthLimbConstraint, SAAPolygonConstraint
import astropy.units as u  # type: ignore

"""Define constraints for the BurstCube Mission."""

burstcube_saa_constraint = SAAPolygonConstraint(
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


# EarthLimbConstraint
burstcube_earth_constraint = EarthLimbConstraint(min_angle=0 * u.deg)
