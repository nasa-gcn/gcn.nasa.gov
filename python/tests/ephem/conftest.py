# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

import pytest
import pytest_asyncio
from across_api.base.schema import TLEEntry  # type: ignore[import]
from across_api.burstcube.ephem import BurstCubeEphem  # type: ignore[import]
from across_api.swift.ephem import SwiftEphem  # type: ignore[import]
from astropy.time import Time  # type: ignore[import]
from skyfield.api import (  # type: ignore[import]
    EarthSatellite,
    load,
    utc,
    wgs84,
)


class ExpectedSkyField:
    def __init__(self, posvec, velocity, lat, lon, sunra, sundec, moonra, moondec):
        self.posvec = posvec
        self.velocity = velocity
        self.lat = lat
        self.lon = lon
        self.sunra = sunra
        self.sundec = sundec
        self.moonra = moonra
        self.moondec = moondec


@pytest.fixture
def burstcube_tle():
    # Define a TLE by hand
    satname = "ISS (ZARYA)"
    tle1 = "1 25544U 98067A   24003.59801929  .00015877  00000-0  28516-3 0  9995"
    tle2 = "2 25544  51.6422  55.8239 0003397 348.6159 108.6885 15.50043818432877"
    tleentry = TLEEntry(satname=satname, tle1=tle1, tle2=tle2)
    return tleentry


@pytest_asyncio.fixture
async def burstcube_ephem(burstcube_tle):
    # Calculate a BurstCube Ephemeris
    ephem = BurstCubeEphem(begin=Time("2024-01-01"), end=Time("2024-01-01 00:05:00"))
    ephem.tle = burstcube_tle
    await ephem.get()
    return ephem


@pytest.fixture
def swift_tle():
    # Define a TLE by hand
    satname = "SWIFT"
    tle1 = "1 28485U 04047A   24029.43721350  .00012795  00000-0  63383-3 0  9994"
    tle2 = "2 28485  20.5570  98.6682 0008279 273.6948  86.2541 15.15248522 52921"
    tleentry = TLEEntry(satname=satname, tle1=tle1, tle2=tle2)

    return tleentry


@pytest_asyncio.fixture
async def swift_ephem(swift_tle):
    # Calculate a Swift Ephemeris
    ephem = SwiftEphem(begin=Time("2024-01-29"), end=Time("2024-01-29 00:05:00"))
    ephem.tle = swift_tle
    await ephem.get()
    return ephem


@pytest.fixture
def expected_burstcube_skyfield(burstcube_tle, burstcube_ephem):
    # Compute GCRS position using Skyfield library
    #

    ts = load.timescale()
    bodies = load("de421.bsp")
    satellite = EarthSatellite(
        burstcube_tle.tle1, burstcube_tle.tle2, burstcube_tle.satname, ts
    )
    nowts = ts.from_datetimes(
        [dt.replace(tzinfo=utc) for dt in burstcube_ephem.timestamp.datetime]
    )
    gcrs = satellite.at(nowts)
    posvec = gcrs.position.km

    # Skyfield calculate velocity
    velocity = gcrs.velocity.km_per_s

    # Calculate lat/lon using Skyfield
    lat, lon = wgs84.latlon_of(gcrs)

    # Calculate Sun position as seen from the satellite orbiting the Earth
    sunpos = (bodies["Earth"] + satellite).at(nowts).observe(bodies["Sun"])
    sunra = sunpos.apparent().radec()[0]._degrees
    sundec = sunpos.apparent().radec()[1].degrees

    # Calculate Moon position as seen from the satellite orbiting the Earth
    moonpos = (bodies["Earth"] + satellite).at(nowts).observe(bodies["Moon"])
    moonra = moonpos.apparent().radec()[0]._degrees
    moondec = moonpos.apparent().radec()[1].degrees

    return ExpectedSkyField(
        posvec=posvec,
        velocity=velocity,
        lat=lat.degrees,
        lon=lon.degrees,
        sunra=sunra,
        sundec=sundec,
        moonra=moonra,
        moondec=moondec,
    )


@pytest.fixture
def expected_swift_skyfield(swift_tle, swift_ephem):
    # Compute GCRS position using Skyfield library

    ts = load.timescale()
    satellite = EarthSatellite(swift_tle.tle1, swift_tle.tle2, swift_tle.satname, ts)
    bodies = load("de421.bsp")
    nowts = ts.from_datetimes(
        [dt.replace(tzinfo=utc) for dt in swift_ephem.timestamp.datetime]
    )
    gcrs = satellite.at(nowts)
    posvec = gcrs.position.km

    # Skyfield calculate velocity
    velocity = gcrs.velocity.km_per_s

    # Calculate lat/lon using Skyfield
    lat, lon = wgs84.latlon_of(gcrs)

    # Calculate Sun position as seen from the satellite orbiting the Earth
    sunpos = (bodies["Earth"] + satellite).at(nowts).observe(bodies["Sun"])
    sunra = sunpos.apparent().radec()[0]._degrees
    sundec = sunpos.apparent().radec()[1].degrees

    # Calculate Moon position as seen from the satellite orbiting the Earth
    moonpos = (bodies["Earth"] + satellite).at(nowts).observe(bodies["Moon"])
    moonra = moonpos.apparent().radec()[0]._degrees
    moondec = moonpos.apparent().radec()[1]._degrees

    return ExpectedSkyField(
        posvec=posvec,
        velocity=velocity,
        lat=lat.degrees,
        lon=lon.degrees,
        sunra=sunra,
        sundec=sundec,
        moonra=moonra,
        moondec=moondec,
    )
