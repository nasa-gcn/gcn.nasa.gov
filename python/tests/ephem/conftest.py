# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

import pytest
import numpy as np
from astropy.time import Time  # type: ignore
from across_api.burstcube.ephem import BurstCubeEphem  # type: ignore
from across_api.burstcube.tle import BurstCubeTLE  # type: ignore
from across_api.swift.ephem import SwiftEphem  # type: ignore
from across_api.swift.tle import SwiftTLE  # type: ignore
from across_api.base.schema import TLEEntry  # type: ignore


class ExpectedSkyField:
    def __init__(self, posvec, velocity, lat, lon, sunra, sundec, moonra, moondec):
        self.posvec = posvec
        self.velocity = (velocity,)
        self.lat = (lat,)
        self.lon = (lon,)
        self.sunra = (sunra,)
        self.sundec = (sundec,)
        self.moonra = (moonra,)
        self.moondec = moondec


@pytest.fixture
def burstcube_ephem():
    # Define a TLE by hand
    satname = "ISS (ZARYA)"
    tle1 = "1 25544U 98067A   24003.59801929  .00015877  00000-0  28516-3 0  9995"
    tle2 = "2 25544  51.6422  55.8239 0003397 348.6159 108.6885 15.50043818432877"
    tleentry = TLEEntry(satname=satname, tle1=tle1, tle2=tle2)

    # Manually load this TLE
    tle = BurstCubeTLE(epoch=Time("2024-01-01"), tle=tleentry)

    # Calculate a BurstCube Ephemeris
    return BurstCubeEphem(
        begin=Time("2024-01-01"), end=Time("2024-01-01 00:05:00"), tle=tle.tle
    )


@pytest.fixture
def swift_ephem():
    # Define a TLE by hand
    satname = "SWIFT"
    tle1 = "1 28485U 04047A   24029.43721350  .00012795  00000-0  63383-3 0  9994"
    tle2 = "2 28485  20.5570  98.6682 0008279 273.6948  86.2541 15.15248522 52921"
    tleentry = TLEEntry(satname=satname, tle1=tle1, tle2=tle2)

    # Manually load this TLE
    tle = SwiftTLE(epoch=Time("2024-01-29"), tle=tleentry)

    # Calculate a Swift Ephemeris
    return SwiftEphem(
        begin=Time("2024-01-29"), end=Time("2024-01-29 00:05:00"), tle=tle.tle
    )


@pytest.fixture
def expected_burstcube_skyfield():
    # Compute GCRS position using Skyfield library
    # from skyfield.api import load, wgs84, EarthSatellite, utc

    # satname = "ISS (ZARYA)"
    # tle1 = "1 25544U 98067A   24003.59801929  .00015877  00000-0  28516-3 0  9995"
    # tle2 = "2 25544  51.6422  55.8239 0003397 348.6159 108.6885 15.50043818432877"
    # ts = load.timescale()
    # satellite = EarthSatellite(tle1, tle2, satname, ts)
    # bodies = load("de421.bsp")
    # nowts = ts.from_datetimes([dt.replace(tzinfo=utc) for dt in eph.timestamp.datetime])
    # gcrs = satellite.at(nowts)
    # posvec = gcrs.position.km
    # posvec

    posvec = np.array(
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

    # Skyfield calculate velocity
    # gcrs.velocity.km_per_s
    velocity = np.array(
        [
            [
                -3.89219421,
                -4.12001516,
                -4.32900941,
                -4.51820512,
                -4.68672262,
                -4.83377889,
            ],
            [2.87775303, 2.41476409, 1.94062072, 1.45750803, 0.96765472, 0.47332214],
            [5.94091899, 5.99390616, 6.01936913, 6.01717993, 5.98734059, 5.92998321],
        ]
    )

    # Calculate lat/lon using Skyfield
    # lat, lon = wgs84.latlon_of(gcrs)

    # lat.degrees
    lat = np.array(
        [-7.34620853, -4.29603822, -1.23756857, 1.82349873, 4.88150001, 7.93070336]
    )

    # lon.degrees
    lon = np.array(
        [
            -37.27659609,
            -35.09670928,
            -32.93574936,
            -30.78004142,
            -28.61598827,
            -26.4298605,
        ]
    )

    # Calculate Sun position as seen from the satellite orbiting the Earth
    # sunpos = (bodies["Earth"] + satellite).at(nowts).observe(bodies["Sun"])
    # sunra = sunpos.apparent().radec()[0]._degrees
    #
    # sunra
    sunra = np.array(
        [
            280.55657134,
            280.55736204,
            280.55816379,
            280.55897644,
            280.55979979,
            280.56063359,
        ]
    )
    # sundec = sunpos.apparent().radec()[0]._degrees
    #
    # sundec
    sundec = np.array(
        [
            -23.07915326,
            -23.07915921,
            -23.07917361,
            -23.07919616,
            -23.07922653,
            -23.07926433,
        ]
    )

    # Calculate Moon position as seen from the satellite orbiting the Earth
    # moonpos = (bodies["Earth"] + satellite).at(nowts).observe(bodies["Moon"])
    #
    # moonpos.apparent().radec()[0]._degrees
    moonra = np.array(
        [
            159.77137018,
            159.78862186,
            159.80141207,
            159.809707,
            159.81349339,
            159.81277874,
        ]
    )
    #
    # moonpos.apparent().radec()[1]._degrees
    moondec = np.array(
        [12.84719405, 12.80310308, 12.75868635, 12.71413103, 12.6696258, 12.62535993]
    )

    return ExpectedSkyField(
        posvec=posvec,
        velocity=velocity,
        lat=lat,
        lon=lon,
        sunra=sunra,
        sundec=sundec,
        moonra=moonra,
        moondec=moondec,
    )


@pytest.fixture
def expected_swift_skyfield():
    # Compute GCRS position using Skyfield library
    # from skyfield.api import load, wgs84, EarthSatellite, utc

    # satname = "SWIFT"
    # tle1 = "1 28485U 04047A   24029.43721350  .00012795  00000-0  63383-3 0  9994"
    # tle2 = "2 28485  20.5570  98.6682 0008279 273.6948  86.2541 15.15248522 52921"
    # ts = load.timescale()
    # satellite = EarthSatellite(tle1, tle2, satname, ts)
    # bodies = load("de421.bsp")
    # nowts = ts.from_datetimes([dt.replace(tzinfo=utc) for dt in eph.timestamp.datetime])
    # gcrs = satellite.at(nowts)
    # posvec = gcrs.position.km
    # posvec

    posvec = np.array(
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

    # Skyfield calculate velocity
    # gcrs.velocity.km_per_s
    velocity = np.array(
        [
            [5.59057289, 5.87140084, 6.12657304, 6.3549683, 6.55558167, 6.72752905],
            [
                -4.86407618,
                -4.46866974,
                -4.05367016,
                -3.62088727,
                -3.17220958,
                -2.70959622,
            ],
            [
                -1.70752377,
                -1.84127551,
                -1.96696431,
                -2.08403741,
                -2.19197943,
                -2.29031471,
            ],
        ]
    )

    # Calculate lat/lon using Skyfield
    # lat, lon = wgs84.latlon_of(gcrs)

    # lat.degrees
    lat = np.array(
        [15.83859755, 14.92370425, 13.94588103, 12.90989575, 11.82064667, 10.68313044]
    )

    # lon.degrees
    lon = np.array(
        [
            105.23276066,
            108.79628721,
            112.32691818,
            115.82523204,
            119.29234661,
            122.72987384,
        ]
    )

    # Calculate Sun position as seen from the satellite orbiting the Earth
    # sunpos = (bodies["Earth"] + satellite).at(nowts).observe(bodies["Sun"])
    # sunra = sunpos.apparent().radec()[0]._degrees
    #
    # sunra
    sunra = np.array(
        [
            310.63900074,
            310.63978046,
            310.64054735,
            310.6413012,
            310.64204183,
            310.64276916,
        ]
    )
    # sundec = sunpos.apparent().radec()[0]._degrees
    #
    # sundec
    sundec = np.array(
        [
            -18.20980286,
            -18.20966515,
            -18.20952402,
            -18.20937928,
            -18.20923076,
            -18.20907831,
        ]
    )

    # Calculate Moon position as seen from the satellite orbiting the Earth
    # moonpos = (bodies["Earth"] + satellite).at(nowts).observe(bodies["Moon"])
    #
    # moonpos.apparent().radec()[0]._degrees
    moonra = np.array(
        [
            165.39248665,
            165.37337541,
            165.35826335,
            165.34723799,
            165.34036809,
            165.33770354,
        ]
    )
    #
    # moonpos.apparent().radec()[1]._degrees
    moondec = np.array(
        [8.71492202, 8.71744169, 8.72084558, 8.72509989, 8.73016706, 8.73600592]
    )

    return ExpectedSkyField(
        posvec=posvec,
        velocity=velocity,
        lat=lat,
        lon=lon,
        sunra=sunra,
        sundec=sundec,
        moonra=moonra,
        moondec=moondec,
    )
