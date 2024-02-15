import astropy.units as u
from across_api.swift.fov import SwiftFOV
from across_api.base.pointing import PointingBase


def test_swift_fov_point_source(AT2017gfo_skycoord):
    """Skyfield calculation of Earth Occultation and ACROSS API should give the same answer."""
    # Perform the same calculation using the ACROSS API BurstCubeFOV class.
    # Should report True if the trigger was in the FOV.
    fov = SwiftFOV(
        pointing=PointingBase(
            ra=AT2017gfo_skycoord.ra.value,
            dec=AT2017gfo_skycoord.dec.value,
            position_angle=0,
        )
    )
    assert (
        fov.probability_in_fov(skycoord=AT2017gfo_skycoord) == 1.0  # noqa: E712
    ), "SwiftFOV should report this trigger as outside of Earth Occultation"


def test_swift_fov_error(AT2017gfo_skycoord):
    """Check that for a circular error box of radius 20 degrees, the infov
    fraction of the probability is 0.92439."""
    fov = SwiftFOV(
        pointing=PointingBase(
            ra=AT2017gfo_skycoord.ra.value,
            dec=AT2017gfo_skycoord.dec.value,
            position_angle=0,
        )
    )
    in_fov_prob = fov.probability_in_fov(
        skycoord=AT2017gfo_skycoord, error_radius=1 * u.deg
    )
    assert in_fov_prob == 0.03687


def test_swift_fov_healpix(AT2017gfo_skycoord, AT2017gfo_healpix_probability):
    fov = SwiftFOV(
        pointing=PointingBase(
            ra=AT2017gfo_skycoord.ra.value,
            dec=AT2017gfo_skycoord.dec.value,
            position_angle=0,
        )
    )
    in_fov_prob = fov.probability_in_fov(healpix_loc=AT2017gfo_healpix_probability)
    assert (
        in_fov_prob == 0.0193
    ), "0.0193% of the probability of GW170817 should be inside the FOV for swift"
