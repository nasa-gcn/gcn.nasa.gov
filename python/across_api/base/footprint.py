# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.


from astropy import units as u
from astropy.coordinates.representation import (
    CartesianRepresentation,
    UnitSphericalRepresentation,
)
from astropy.coordinates.matrix_utilities import rotation_matrix


class Footprint:
    polygon: list = []

    def __init__(self, polygon: list) -> None:
        self.polygon = polygon

    def project(self, ra, dec, pos_angle):
        if pos_angle is None:
            pos_angle = 0.0

        projected_footprint = (
            UnitSphericalRepresentation(
                u.Quantity([pt[0] for pt in self.polygon], u.deg),
                u.Quantity([pt[1] for pt in self.polygon], u.deg),
            )
            .represent_as(CartesianRepresentation)
            .transform(rotation_matrix(-1.0 * pos_angle * u.deg, axis="x"))
            .transform(rotation_matrix(dec * u.deg, axis="y"))
            .transform(rotation_matrix(-1.0 * ra * u.deg, axis="z"))
            .represent_as(UnitSphericalRepresentation)
        )

        projected_ra = [
            round(lon.to(u.deg).value, 3) for lon in projected_footprint.lon
        ]
        projected_dec = [
            round(lat.to(u.deg).value, 3) for lat in projected_footprint.lat
        ]

        return list(zip(projected_ra, projected_dec))
