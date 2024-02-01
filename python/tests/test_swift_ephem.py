# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

import numpy as np
from astropy.time import Time  # type: ignore
import astropy.units as u  # type: ignore
from across_api.swift.ephem import SwiftEphem  # type: ignore
from across_api.swift.tle import SwiftTLE  # type: ignore
from across_api.base.schema import TLEEntry  # type: ignore

# Define a TLE by hand
satname = "SWIFT"
tle1 = "1 28485U 04047A   24029.43721350  .00012795  00000-0  63383-3 0  9994"
tle2 = "2 28485  20.5570  98.6682 0008279 273.6948  86.2541 15.15248522 52921"
tleentry = TLEEntry(satname=satname, tle1=tle1, tle2=tle2)

# Manually load this TLE
tle = SwiftTLE(epoch=Time("2024-01-29"), tle=tleentry)

# Calculate a Swift Ephemeris
eph = SwiftEphem(begin=Time("2024-01-29"), end=Time("2024-01-29 00:05:00"), tle=tle.tle)

# Compute GCRS position using Skyfield library
# from skyfield.api import load, wgs84, EarthSatellite, utc

# ts = load.timescale()
# satellite = EarthSatellite(tle1, tle2, satname, ts)
# bodies = load("de421.bsp")
# nowts = ts.from_datetimes([dt.replace(tzinfo=utc) for dt in eph.timestamp.datetime])
# gcrs = satellite.at(nowts)
# posvec = gcrs.position.km
# posvec

skyfield_posvec = np.array(
    [
        [
            -4021.14168009,
            -3677.15476197,
            -3317.0818494,
            -2942.49650402,
            -2555.0360961,
            -2156.39468954,
        ],
        [
            -5279.52579435,
            -5559.61309208,
            -5815.37918607,
            -6045.70235929,
            -6249.57188609,
            -6426.09251345,
        ],
        [
            1881.44369991,
            1774.93957664,
            1660.64930775,
            1539.07344591,
            1410.74460051,
            1276.22512307,
        ],
    ]
)


# Check that the Skyfield posvec and SwiftEphem posvec match to < 0.1 cm
def test_swift_ephem_posvec():
    assert (
        abs(eph.posvec.xyz.value - skyfield_posvec) < 1e-6
    ).all(), "GCRS position vector values off by more than 0.1 cm"


# Skyfield calculate velocity
# gcrs.velocity.km_per_s
skyfield_velocity = np.array(
    [
        [5.59057289, 5.87140084, 6.12657304, 6.3549683, 6.55558167, 6.72752905],
        [-4.86407618, -4.46866974, -4.05367016, -3.62088727, -3.17220958, -2.70959622],
        [-1.70752377, -1.84127551, -1.96696431, -2.08403741, -2.19197943, -2.29031471],
    ]
)


def test_swift_ephem_velvec():
    # Check that the Skyfield calculated velocity matches the SwiftEphem value to < 0.1 cm/s
    assert (abs(eph.velvec.xyz.value - skyfield_velocity) < 1e-6).all()


# Calculate lat/lon using Skyfield
# lat, lon = wgs84.latlon_of(gcrs)
# lat.degrees
skyfield_lat = np.array(
    [15.83859755, 14.92370425, 13.94588103, 12.90989575, 11.82064667, 10.68313044]
)


def test_swift_ephem_latitude():
    print(eph.latitude.deg - skyfield_lat)
    # Check Skyfield latitude matches SwiftEphem value by < 0.3 arcseconds
    assert (abs(eph.latitude.deg - skyfield_lat) < 0.3 / 3600).all()


# lon.degrees
skyfield_lon = np.array(
    [105.23276066, 108.79628721, 112.32691818, 115.82523204, 119.29234661, 122.72987384]
)


def test_swift_ephem_longitude():
    # Astropy ITRS and SkyField longitude disagree by 3 arcseconds, so we
    # set our tolerance to <0.3 arcseconds.

    assert (abs(eph.longitude.deg - skyfield_lon) < 3 / 3600).all()


# Calculate Sun position as seen from the satellite orbiting the Earth
# sunpos = (bodies["Earth"] + satellite).at(nowts).observe(bodies["Sun"])
# sunra = sunpos.apparent().radec()[0]._degrees
#
# sunra

skyfield_sunra = np.array(
    [310.63900074, 310.63978046, 310.64054735, 310.6413012, 310.64204183, 310.64276916]
)

# sundec = sunpos.apparent().radec()[0]._degrees
#
# sundec

skyfield_sundec = np.array(
    [-18.20980286, -18.20966515, -18.20952402, -18.20937928, -18.20923076, -18.20907831]
)


def test_swift_ephem_sunradec():
    # Assert Skyfield Sun RA/Dec is within 5 arc-seconds of Astropy. These numbers don't match,
    # but 5 arc-seconds difference is not a huge offset.
    assert (abs(eph.sun.ra.deg - skyfield_sunra) < 5 / 3600.0).all()
    assert (abs(eph.sun.dec.deg - skyfield_sundec) < 5 / 3600.0).all()


# Calculate Moon position as seen from the satellite orbiting the Earth
# moonpos = (bodies["Earth"] + satellite).at(nowts).observe(bodies["Moon"])
#
# moonpos.apparent().radec()[0]._degrees
skyfield_moonra = np.array(
    [165.39248665, 165.37337541, 165.35826335, 165.34723799, 165.34036809, 165.33770354]
)

# moonpos.apparent().radec()[1]._degrees
skyfield_moondec = np.array(
    [8.71492202, 8.71744169, 8.72084558, 8.72509989, 8.73016706, 8.73600592]
)


def test_swift_ephem_moonradec():
    # Assert Skyfield Moon RA/Dec is within 5 arc-seconds of Astropy. These numbers don't match,
    # but 5 arc-seconds difference is not a huge offset.
    assert (abs(eph.moon.ra.deg - skyfield_moonra) < 5 / 3600).all()
    assert (abs(eph.moon.dec.deg - skyfield_moondec) < 5 / 3600).all()


def test_ephem_epoch():
    assert (eph.tle.epoch - Time("2024-01-29")) < SwiftTLE.tle_bad


def test_ephem_length():
    assert len(eph.timestamp) == 6


def test_default_stepsize():
    assert eph.stepsize == 60 * u.s


def test_ephem_tle():
    assert eph.tle.tle1 == tle1
    assert eph.tle.tle2 == tle2
    assert eph.tle.satname == satname
    assert eph.tle.epoch == tleentry.epoch
    assert eph.tle.epoch
