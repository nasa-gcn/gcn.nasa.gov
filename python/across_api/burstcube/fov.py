# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from ..base.constraints import EarthLimbConstraint
from ..base.fov import AllSkyFOV
from .constraints import burstcube_earth_constraint


class BurstCubeFOV(AllSkyFOV):
    """
    Define the BurstCube FOV. BurstCube is an all-sky instrument, so the FOV is
    defined by the Earth limb constraint.
    """

    earth_constraint: EarthLimbConstraint = burstcube_earth_constraint
