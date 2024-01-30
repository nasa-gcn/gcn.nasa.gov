# Perform an SwiftEphem API call


import numpy as np
from astropy.time import Time  # type: ignore
import astropy.units as u  # type: ignore
from across_api.swift.ephem import SwiftEphem  # type: ignore
from across_api.swift.tle import SwiftTLE  # type: ignore
from across_api.base.schema import TLEEntry

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
        [-4021.14168008, -3588.58428427, -3131.50230864, -2653.0164915, -2156.39468954],
        [
            -5279.52579436,
            -5625.88039737,
            -5933.78696439,
            -6201.13550554,
            -6426.09251345,
        ],
        [1881.44369991, 1747.07797651, 1600.73951274, 1443.4296362, 1276.22512307],
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
        [5.59057289, 5.93764486, 6.24418338, 6.50808334, 6.72752905],
        [-4.86407618, -4.36668742, -3.83938535, -3.28576312, -2.70959622],
        [-1.70752377, -1.87347582, -2.02661094, -2.16587667, -2.29031471],
    ]
)


def test_swift_ephem_velvec():
    # Check that the Skyfield calculated velocity matches the SwiftEphem value to < 0.1 cm/s
    assert (abs(eph.velvec.xyz.value - skyfield_velocity) < 1e-6).all()


# Calculate lat/lon using Skyfield
# lat, lon = wgs84.latlon_of(gcrs)
# lat.degrees
skyfield_lat = np.array(
    [15.83859755, 14.68496444, 13.43485516, 12.09768058, 10.68313044]
)


def test_swift_ephem_latitude():
    print(eph.latitude.deg - skyfield_lat)
    # Check Skyfield latitude matches SwiftEphem value by < 0.3 arcseconds
    assert (abs(eph.latitude.deg - skyfield_lat) < 0.3 / 3600).all()


# lon.degrees
skyfield_lon = np.array(
    [105.23334776, 109.68260303, 114.08064412, 118.42899985, 122.73046095]
)


def test_swift_ephem_longitude():
    # Astropy ITRS and SkyField longitude disagree by 0.13 arcseconds, so we
    # set our tolerance to <0.3 arcseconds.

    assert (abs(eph.longitude.deg - skyfield_lon) < 0.3 / 3600).all()


# Calculate Sun position as seen from the satellite orbiting the Earth
# sunpos = (bodies["Earth"] + satellite).at(nowts).observe(bodies["Sun"])
# sunra = sunpos.apparent().radec()[0]._degrees
#
# sunra

skyfield_sunra = np.array(
    [310.63900074, 310.6399734, 310.64092592, 310.64185792, 310.64276916]
)

# sundec = sunpos.apparent().radec()[0]._degrees
#
# sundec

skyfield_sundec = np.array(
    [-18.20980286, -18.2096302, -18.20945211, -18.20926825, -18.20907831]
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
    [165.39248665, 165.36921874, 165.3522351, 165.34169294, 165.33770354]
)

# moonpos.apparent().radec()[1]._degrees
skyfield_moondec = np.array(
    [8.71492202, 8.71821102, 8.72286869, 8.72882625, 8.73600592]
)


def test_swift_ephem_moonradec():
    # Assert Skyfield Moon RA/Dec is within 5 arc-seconds of Astropy. These numbers don't match,
    # but 5 arc-seconds difference is not a huge offset.
    assert (abs(eph.moon.ra.deg - skyfield_moonra) < 5 / 3600).all()
    assert (abs(eph.moon.dec.deg - skyfield_moondec) < 5 / 3600).all()


def test_ephem_epoch():
    assert (eph.tle.epoch - Time("2024-01-29")) < SwiftTLE.tle_bad


def test_ephem_length():
    assert len(eph.timestamp) == 5


def test_default_stepsize():
    assert eph.stepsize == 60 * u.s


def test_ephem_tle():
    assert eph.tle.tle1 == tle1
    assert eph.tle.tle2 == tle2
    assert eph.tle.satname == satname
    assert eph.tle.epoch == tleentry.epoch
    assert eph.tle.epoch
