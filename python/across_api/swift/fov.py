# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from ..base.fov import FootprintFOV
from ..base.footprint import Footprint


class SwiftFootprint(Footprint):
    """
    footprint taken from the one at treasuremap.space
    """

    def __init__(self) -> None:
        super().__init__(
            polygon=[
                [0.2, 0.0],
                [0.1827090915285202, -0.08134732861516],
                [0.1338261212717717, -0.1486289650954788],
                [0.0618033988749895, -0.1902113032590307],
                [-0.0209056926535307, -0.1989043790736547],
                [-0.1, -0.1732050807568878],
                [-0.1618033988749895, -0.1175570504584947],
                [-0.1956295201467611, -0.0415823381635519],
                [-0.1956295201467612, 0.0415823381635518],
                [-0.1618033988749895, 0.1175570504584946],
                [-0.1000000000000001, 0.1732050807568877],
                [-0.0209056926535308, 0.1989043790736547],
                [0.0618033988749894, 0.1902113032590307],
                [0.1338261212717716, 0.1486289650954789],
                [0.1827090915285201, 0.0813473286151602],
                [0.2, 0.0],
            ]
        )


class SwiftFOV(FootprintFOV):
    """
    Define the Swift FOV. Swift is pointed instrument, so the FOV is
    defined by the ccd footprint (centered around 0). Polygon taken from treasuremap
    """

    footprint = SwiftFootprint()
