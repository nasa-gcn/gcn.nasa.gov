# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

import numpy as np
from astropy.time import Time  # type: ignore
import astropy.units as u  # type: ignore
from across_api.burstcube.ephem import BurstCubeEphem  # type: ignore
from across_api.burstcube.tle import BurstCubeTLE  # type: ignore
from across_api.base.schema import TLEEntry  # type: ignore

# Define a TLE by hand
satname = "ISS (ZARYA)"
tle1 = "1 25544U 98067A   24003.59801929  .00015877  00000-0  28516-3 0  9995"
tle2 = "2 25544  51.6422  55.8239 0003397 348.6159 108.6885 15.50043818432877"
tleentry = TLEEntry(satname=satname, tle1=tle1, tle2=tle2)

# Manually load this TLE
tle = BurstCubeTLE(epoch=Time("2024-01-01"), tle=tleentry)

# Calculate a BurstCube Ephemeris
eph = BurstCubeEphem(
    begin=Time("2024-01-01"), end=Time("2024-01-01 00:05:00"), tle=tle.tle
)


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
            3102.62364411,
            2862.16585313,
            2608.59848659,
            2343.0807521,
            2066.82742813,
            1781.10319625,
        ],
        [
            5981.53068666,
            6140.36702165,
            6271.07862231,
            6373.06152239,
            6445.84422401,
            6489.08998678,
        ],
        [
            -870.78766934,
            -512.60637227,
            -152.07061193,
            209.16367558,
            569.43677198,
            927.09298308,
        ],
    ]
)


# Check that the Skyfield posvec and BurstCubeEphem posvec match to < 0.1 cm
def test_burstcube_ephem_posvec():
    assert (
        abs(eph.posvec.xyz.value - skyfield_posvec) < 1e-6
    ).all(), "GCRS position vector values off by more than 0.1 cm"


# Skyfield calculate velocity
# gcrs.velocity.km_per_s
skyfield_velocity = np.array(
    [
        [-3.89219421, -4.12001516, -4.32900941, -4.51820512, -4.68672262, -4.83377889],
        [2.87775303, 2.41476409, 1.94062072, 1.45750803, 0.96765472, 0.47332214],
        [5.94091899, 5.99390616, 6.01936913, 6.01717993, 5.98734059, 5.92998321],
    ]
)


def test_burstcube_ephem_velvec():
    # Check that the Skyfield calculated velocity matches the BurstCubeEphem value to < 0.1 cm/s
    assert abs(eph.velvec.xyz.value - skyfield_velocity < 1e-6).all()


# Calculate lat/lon using Skyfield
# lat, lon = wgs84.latlon_of(gcrs)
# lat.degrees
skyfield_lat = np.array(
    [-7.34620853, -4.29603822, -1.23756857, 1.82349873, 4.88150001, 7.93070336]
)


def test_burstcube_ephem_latitude():
    # Check Skyfield latitude matches BurstCubeEphem value by < 0.3 arcseconds
    assert (abs(eph.latitude.deg - skyfield_lat) < 0.3 / 3600).all()


# lon.degrees
skyfield_lon = np.array(
    [-37.27659609, -35.09670928, -32.93574936, -30.78004142, -28.61598827, -26.4298605]
)


def test_burstcube_ephem_longitude():
    # Astropy ITRS and SkyField longitude disagree by ~3 arcseconds, so we set our tolerance to <3 arcseconds.
    assert (abs(eph.longitude.deg - skyfield_lon) < 3 / 3600).all()


# Calculate Sun position as seen from the satellite orbiting the Earth
# sunpos = (bodies["Earth"] + satellite).at(nowts).observe(bodies["Sun"])
# sunra = sunpos.apparent().radec()[0]._degrees
#
# sunra
skyfield_sunra = np.array(
    [280.55657134, 280.55736204, 280.55816379, 280.55897644, 280.55979979, 280.56063359]
)
# sundec = sunpos.apparent().radec()[0]._degrees
#
# sundec
skyfield_sundec = np.array(
    [-23.07915326, -23.07915921, -23.07917361, -23.07919616, -23.07922653, -23.07926433]
)


def test_burstcube_ephem_sunra():
    # Assert Skyfield Sun RA/Dec is within 5 arc-seconds of Astropy. These numbers don't match,
    # but 5 arc-seconds difference is not a huge offset.
    assert (abs(eph.sun.ra.deg - skyfield_sunra) < 5 / 3600.0).all()


def test_burstcube_ephem_sundec():
    assert (abs(eph.sun.dec.deg - skyfield_sundec) < 5 / 3600.0).all()


# Calculate Moon position as seen from the satellite orbiting the Earth
# moonpos = (bodies["Earth"] + satellite).at(nowts).observe(bodies["Moon"])
#
# moonpos.apparent().radec()[0]._degrees
skyfield_moonra = np.array(
    [159.77137018, 159.78862186, 159.80141207, 159.809707, 159.81349339, 159.81277874]
)
#
# moonpos.apparent().radec()[1]._degrees
skyfield_moondec = np.array(
    [12.84719405, 12.80310308, 12.75868635, 12.71413103, 12.6696258, 12.62535993]
)


def test_burstcube_ephem_moonradec():
    # Assert Skyfield Moon RA/Dec is within 5 arc-seconds of Astropy. These numbers don't match,
    # but 5 arc-seconds difference is not a huge offset.
    assert (abs(eph.moon.ra.deg - skyfield_moonra) < 5 / 3600).all()
    assert (abs(eph.moon.dec.deg - skyfield_moondec) < 5 / 3600).all()


def test_ephem_epoch():
    assert (eph.tle.epoch - Time("2024-01-01")) < BurstCubeTLE.tle_bad


def test_ephem_length():
    assert len(eph.timestamp) == 6


def test_default_stepsize():
    assert eph.stepsize == 60 * u.s
