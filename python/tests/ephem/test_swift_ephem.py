# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

import astropy.units as u  # type: ignore
from across_api.swift.tle import SwiftTLE  # type: ignore
from astropy.time import Time  # type: ignore


def test_swift_ephem_posvec(swift_ephem, expected_swift_skyfield):
    # Check that the Skyfield posvec and SwiftEphem posvec match to < 0.1 cm
    assert (
        abs(swift_ephem.posvec.xyz.value - expected_swift_skyfield.posvec) < 1e-6
    ).all(), "GCRS position vector values off by more than 0.1 cm"


def test_swift_ephem_velvec(swift_ephem, expected_swift_skyfield):
    # Check that the Skyfield calculated velocity matches the SwiftEphem value to < 0.1 cm/s
    assert abs(
        swift_ephem.velvec.xyz.value - expected_swift_skyfield.velocity < 1e-6
    ).all(), "GCRS velocity vector values off by more than 0.1 cm/s"


def test_swift_ephem_latlon(swift_ephem, expected_swift_skyfield):
    # Check Skyfield latitude matches SwiftEphem value by < 0.3 arcseconds
    assert (
        abs(swift_ephem.latitude.deg - expected_swift_skyfield.lat) < 0.3 / 3600
    ).all(), "GCRS latitude values off by more than 3 arcseconds"

    # Check Skyfield latitude matches SwiftEphem value by < 0.3 arcseconds
    assert (
        abs(swift_ephem.longitude.deg - expected_swift_skyfield.lon) < 3 / 3600
    ).all(), "GCRS longitude values off by more than 3 arcseconds"


def test_swift_ephem_sun(swift_ephem, expected_swift_skyfield):
    # Assert Skyfield Sun RA/Dec is within 5 arc-seconds of Astropy. These numbers don't match,
    # but 5 arc-seconds difference is not a huge offset.
    assert (
        abs(swift_ephem.sun.ra.deg - expected_swift_skyfield.sunra) < 5 / 3600.0
    ).all(), "GCRS sun.ra values off by more than 5 arcseconds"

    assert (
        abs(swift_ephem.sun.dec.deg - expected_swift_skyfield.sundec) < 5 / 3600.0
    ).all(), "GCRS sun.dec values off by more than 5 arcseconds"


def test_swift_ephem_moon(swift_ephem, expected_swift_skyfield):
    # Assert Skyfield Moon RA/Dec is within 5 arc-seconds of Astropy. These numbers don't match,
    # but 5 arc-seconds difference is not a huge offset.
    assert (
        abs(swift_ephem.moon.ra.deg - expected_swift_skyfield.moonra) < 5 / 3600
    ).all(), "GCRS moon.ra values off by more than 5 arcseconds"

    assert (
        abs(swift_ephem.moon.dec.deg - expected_swift_skyfield.moondec) < 5 / 3600
    ).all(), "GCRS moon.dec values off by more than 5 arcseconds"


def test_ephem_epoch(swift_ephem):
    assert (swift_ephem.tle.epoch - Time("2024-01-29")) < SwiftTLE.tle_bad


def test_ephem_length(swift_ephem):
    assert len(swift_ephem.timestamp) == 6


def test_default_stepsize(swift_ephem):
    assert swift_ephem.stepsize == 60 * u.s
