# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

import numpy as np
from astropy.time import Time  # type: ignore
import astropy.units as u  # type: ignore
from across_api.burstcube.ephem import BurstCubeEphem  # type: ignore
from across_api.burstcube.tle import BurstCubeTLE  # type: ignore
from across_api.base.schema import TLEEntry

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
        [3102.62364411, 2799.95875402, 2477.25872901, 2136.82885638, 1781.10319625],
        [5981.53068666, 6175.7074466, 6325.69376331, 6430.40680333, 6489.08998679],
        [-870.78766934, -422.62861603, 28.56295111, 479.54929747, 927.09298308],
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
        [-3.89219421, -4.17406822, -4.42613928, -4.64657634, -4.83377889],
        [2.87775303, 2.29718947, 1.70004715, 1.09062677, 0.47332214],
        [5.94091899, 6.00285951, 6.02173398, 5.99738762, 5.92998321],
    ]
)


def test_burstcube_ephem_velvec():
    # Check that the Skyfield calculated velocity matches the BurstCubeEphem value to < 0.1 cm/s
    assert abs(eph.velvec.xyz.value - skyfield_velocity < 1e-6).all()


# Calculate lat/lon using Skyfield
# lat, lon = wgs84.latlon_of(gcrs)
# lat.degrees
skyfield_lat = np.array([-7.34620853, -3.5319745, 0.292994, 4.11759842, 7.93070336])


def test_burstcube_ephem_latitude():
    # Check Skyfield latitude matches BurstCubeEphem value by < 0.3 arcseconds
    assert (abs(eph.latitude.deg - skyfield_lat) < 0.3 / 3600).all()


# lon.degrees
skyfield_lon = np.array(
    [-37.27604624, -34.55468253, -31.85753823, -29.15798066, -26.42931064]
)


def test_burstcube_ephem_longitude():
    # Astropy ITRS and SkyField longitude disagree by 0.13 arcseconds, so we set our tolerance to <0.3 arcseconds.
    assert (abs(eph.longitude.deg - skyfield_lon) < 0.3 / 3600).all()


# Calculate Sun position as seen from the satellite orbiting the Earth
# sunpos = (bodies["Earth"] + satellite).at(nowts).observe(bodies["Sun"])
# sunra = sunpos.apparent().radec()[0]._degrees
#
# sunra
skyfield_sunra = np.array(
    [280.55657134, 280.55756145, 280.55856877, 280.55959297, 280.56063359]
)
# sundec = sunpos.apparent().radec()[0]._degrees
#
# sundec
skyfield_sundec = np.array(
    [-23.07915326, -23.07916203, -23.07918388, -23.07921822, -23.07926433]
)


def test_burstcube_ephem_sunradec():
    # Assert Skyfield Sun RA/Dec is within 5 arc-seconds of Astropy. These numbers don't match,
    # but 5 arc-seconds difference is not a huge offset.
    assert (abs(eph.sun.ra.deg - skyfield_sunra) < 5 / 3600.0).all()
    assert (abs(eph.sun.dec.deg - skyfield_sundec) < 5 / 3600.0).all()


# Calculate Moon position as seen from the satellite orbiting the Earth
# moonpos = (bodies["Earth"] + satellite).at(nowts).observe(bodies["Moon"])
#
# moonpos.apparent().radec()[0]._degrees
skyfield_moonra = np.array(
    [159.77137018, 159.79223935, 159.80612276, 159.81296941, 159.81277874]
)
#
# moonpos.apparent().radec()[1]._degrees
skyfield_moondec = np.array(
    [12.84719405, 12.79202216, 12.73641424, 12.68073706, 12.62535993]
)


def test_burstcube_ephem_moonradec():
    # Assert Skyfield Moon RA/Dec is within 5 arc-seconds of Astropy. These numbers don't match,
    # but 5 arc-seconds difference is not a huge offset.
    assert (abs(eph.moon.ra.deg - skyfield_moonra) < 5 / 3600).all()
    assert (abs(eph.moon.dec.deg - skyfield_moondec) < 5 / 3600).all()


def test_ephem_epoch():
    assert (eph.tle.epoch - Time("2024-01-01")) < BurstCubeTLE.tle_bad


def test_ephem_length():
    assert len(eph.timestamp) == 5


def test_default_stepsize():
    assert eph.stepsize == 60 * u.s
