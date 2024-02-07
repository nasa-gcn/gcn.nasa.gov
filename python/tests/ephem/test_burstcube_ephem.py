# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from astropy.time import Time  # type: ignore
import astropy.units as u  # type: ignore
from across_api.burstcube.tle import BurstCubeTLE  # type: ignore


def test_burstcube_ephem_posvec(burstcube_ephem, expected_burstcube_skyfield):
    # Check that the Skyfield posvec and BurstCubeEphem posvec match to < 0.1 cm
    assert (
        abs(burstcube_ephem.posvec.xyz.value - expected_burstcube_skyfield.posvec)
        < 1e-6
    ).all(), "GCRS position vector values off by more than 0.1 cm"


def test_burstcube_ephem_velvec(burstcube_ephem, expected_burstcube_skyfield):
    # Check that the Skyfield calculated velocity matches the BurstCubeEphem value to < 0.1 cm/s
    assert abs(
        burstcube_ephem.velvec.xyz.value - expected_burstcube_skyfield.velocity < 1e-6
    ).all(), "GCRS velocity vector values off by more than 0.1 cm/s"


def test_burstcube_ephem_latlon(burstcube_ephem, expected_burstcube_skyfield):
    # Check Skyfield latitude matches BurstCubeEphem value by < 0.3 arcseconds
    assert (
        abs(burstcube_ephem.latitude.deg - expected_burstcube_skyfield.lat) < 0.3 / 3600
    ).all(), "GCRS latitude values off by more than 3 arcseconds"

    # Astropy ITRS and SkyField longitude disagree by ~3 arcseconds, so we set our tolerance to <3 arcseconds.
    assert (
        abs(burstcube_ephem.longitude.deg - expected_burstcube_skyfield.lon) < 3 / 3600
    ).all(), "GCRS longitude values off by more than 3 arcseconds"


def test_burstcube_ephem_sun(burstcube_ephem, expected_burstcube_skyfield):
    # Assert Skyfield Sun RA/Dec is within 5 arc-seconds of Astropy. These numbers don't match,
    # but 5 arc-seconds difference is not a huge offset.
    assert (
        abs(burstcube_ephem.sun.ra.deg - expected_burstcube_skyfield.sunra) < 5 / 3600.0
    ).all(), "GCRS sun.ra values off by more than 5 arcseconds"

    assert (
        abs(burstcube_ephem.sun.dec.deg - expected_burstcube_skyfield.sundec)
        < 5 / 3600.0
    ).all(), "GCRS sun.dec values off by more than 5 arcseconds"


def test_burstcube_ephem_moon(burstcube_ephem, expected_burstcube_skyfield):
    # Assert Skyfield Moon RA/Dec is within 5 arc-seconds of Astropy. These numbers don't match,
    # but 5 arc-seconds difference is not a huge offset.
    assert (
        abs(burstcube_ephem.moon.ra.deg - expected_burstcube_skyfield.moonra) < 5 / 3600
    ).all(), "GCRS moon.ra values off by more than 5 arcseconds"

    assert (
        abs(burstcube_ephem.moon.dec.deg - expected_burstcube_skyfield.moondec)
        < 5 / 3600
    ).all(), "GCRS moon.dec values off by more than 5 arcseconds"


def test_ephem_epoch(burstcube_ephem):
    assert (burstcube_ephem.tle.epoch - Time("2024-01-01")) < BurstCubeTLE.tle_bad


def test_ephem_length(burstcube_ephem):
    assert len(burstcube_ephem.timestamp) == 6


def test_default_stepsize(burstcube_ephem):
    assert burstcube_ephem.stepsize == 60 * u.s
