import astropy.units as u  # type: ignore[import]
from across_api.swift.fov import SwiftFOV
from across_api.base.pointing import PointingBase


def test_swift_fov_point_source(AT2017gfo_skycoord):
    """
    Test if constrained FootprintFOV contains source of projected pointing
    """
    fov = SwiftFOV(
        pointing=PointingBase(
            ra=AT2017gfo_skycoord.ra.value,
            dec=AT2017gfo_skycoord.dec.value,
            position_angle=45,
        )
    )
    assert (
        fov.probability_in_fov(skycoord=AT2017gfo_skycoord) == 1.0  # noqa: E712
    ), "SwiftFOV should report this position in the FOV of its pointing"


def test_swift_fov_error(AT2017gfo_skycoord):
    """Check that for a circular error box of radius 20 degrees, the in fov
    fraction of the probability is 0.03687."""
    fov = SwiftFOV(
        pointing=PointingBase(
            ra=AT2017gfo_skycoord.ra.value,
            dec=AT2017gfo_skycoord.dec.value,
            position_angle=45,
        )
    )
    in_fov_prob = round(
        fov.probability_in_fov(skycoord=AT2017gfo_skycoord, error_radius=1 * u.deg), 5
    )
    assert in_fov_prob == 0.03687


def test_swift_fov_healpix(AT2017gfo_skycoord, AT2017gfo_healpix_probability):
    """Check that skymap probability in the constrained fov of Swift is 0.0193."""
    fov = SwiftFOV(
        pointing=PointingBase(
            ra=AT2017gfo_skycoord.ra.value,
            dec=AT2017gfo_skycoord.dec.value,
            position_angle=45,
        )
    )
    in_fov_prob = round(
        fov.probability_in_fov(healpix_loc=AT2017gfo_healpix_probability), 5
    )
    assert (
        in_fov_prob == 0.0193
    ), "0.0193% of the probability of GW170817 should be inside the FOV for Swift"
