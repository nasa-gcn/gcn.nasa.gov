import astropy.units as u  # type: ignore[import]
from astropy.coordinates import angular_separation  # type: ignore[import]


def test_burstcube_fov_point_source(AT2017gfo_skycoord, burstcube_fov):
    """Skyfield calculation of Earth Occultation and ACROSS API should give the same answer."""
    # Assert that the skyfield calculated Earth position is > 70 degrees from
    # the trigger location, i.e. not occulted

    # skyfielld earth position
    skyfield_earthra = 297.96021 * u.deg
    skyfield_earthdec = -3.8946682 * u.deg

    assert (
        angular_separation(
            skyfield_earthra,
            skyfield_earthdec,
            AT2017gfo_skycoord.ra,
            AT2017gfo_skycoord.dec,
        )
        > 70 * u.deg
    ), "This trigger should be not earth occulted"

    # Perform the same calculation using the ACROSS API BurstCubeFOV class.
    # Should report True if the trigger was in the FOV.
    assert (
        burstcube_fov.probability_in_fov(skycoord=AT2017gfo_skycoord) == 1.0  # noqa: E712
    ), "BurstCubeFOV should report this trigger as outside of Earth Occultation"


def test_burstcube_fov_error(AT2017gfo_skycoord, burstcube_fov):
    """Check that for a circular error box of radius 20 degrees, the infov
    fraction of the probability is 0.92439."""
    in_fov_burstcube = round(
        burstcube_fov.probability_in_fov(
            skycoord=AT2017gfo_skycoord, error_radius=20 * u.deg
        ),
        5,
    )
    assert in_fov_burstcube == 0.92439


def test_burstcube_fov_healpix(burstcube_fov, AT2017gfo_healpix_probability):
    in_fov_burstcube = round(
        burstcube_fov.probability_in_fov(healpix_loc=AT2017gfo_healpix_probability), 5
    )
    assert (
        in_fov_burstcube == 1.0
    ), "100% of the probability of GW170817 should be inside the FOV"
