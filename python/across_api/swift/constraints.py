# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

import astropy.units as u  # type: ignore

from ..base.constraints import EarthLimbConstraint, SAAPolygonConstraint

"""Define constraints for the BurstCube Mission."""

# Swift Spacecraft SAA polygon as supplied by Swift team.
swift_saa_constraint = SAAPolygonConstraint(
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

swift_earth_constraint = EarthLimbConstraint(min_angle=33 * u.deg)
