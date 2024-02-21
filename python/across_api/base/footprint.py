# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.


from astropy import units as u  # type: ignore[import]
from astropy.coordinates.representation import (  # type: ignore[import]
    UnitSphericalRepresentation,
)
from astropy.coordinates import SkyCoord  # type: ignore[import]


class Footprint:
    representation: UnitSphericalRepresentation

    def __init__(self, polygon: list) -> None:
        self.representation = UnitSphericalRepresentation(
            u.Quantity([pt[0] for pt in polygon], u.deg),
            u.Quantity([pt[1] for pt in polygon], u.deg),
        )

    def project(self, center: SkyCoord, pos_angle: u.Quantity[u.deg] = 0 * u.deg):
        return SkyCoord(
            self.representation, frame=center.skyoffset_frame(-1.0 * u.deg * pos_angle)
        ).icrs
