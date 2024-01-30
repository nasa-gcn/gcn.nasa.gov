# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

import astropy.units as u  # type: ignore
import numpy as np
import pytest
from across_api.base.schema import TLEEntry  # type: ignore
from across_api.burstcube.ephem import BurstCubeEphem  # type: ignore
from across_api.burstcube.tle import BurstCubeTLE  # type: ignore
from across_api.burstcube.constraints import (  # type: ignore
    burstcube_saa_constraint,
    burstcube_earth_constraint,
)
from across_api.swift.constraints import (  # type: ignore
    swift_earth_constraint,
    swift_saa_constraint,
)
from across_api.swift.ephem import SwiftEphem  # type: ignore
from across_api.swift.tle import SwiftTLE  # type: ignore
from astropy.coordinates import SkyCoord  # type: ignore
from astropy.time import Time  # type: ignore


def make_windows(insaa, timestamp):
    """Function to make start and end windows from a boolean array of SAA
    constraints and array of timestamps"""
    # Find the start and end of the SAA windows
    buff = np.concatenate(([False], insaa.tolist(), [False]))
    begin = np.flatnonzero(~buff[:-1] & buff[1:])
    end = np.flatnonzero(buff[:-1] & ~buff[1:])
    indices = np.column_stack((begin, end - 1))
    windows = timestamp[indices]

    # Return as array of SAAEntry objects
    return np.array([(win[0].unix, win[1].unix) for win in windows])


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
    return SwiftEphem(begin=Time("2024-01-29"), end=Time("2024-01-30"), tle=tle.tle)


@pytest.fixture
def swiftapi_saa_entries():
    # Calculate Swift SAA passages using Swift API
    # from swifttools.swift_too import SAA
    #
    # swift_saa = SAA(begin=Time("2024-01-29"), end=Time("2024-01-30"))
    # swift_saa_entries = np.array(
    #     [(e.begin.timestamp(), e.end.timestamp()) for e in swift_saa]
    # )
    return np.array(
        [
            [1.70648924e09, 1.70649016e09],
            [1.70652691e09, 1.70652721e09],
            [1.70653264e09, 1.70653389e09],
            [1.70653851e09, 1.70653998e09],
            [1.70654440e09, 1.70654596e09],
            [1.70655034e09, 1.70655191e09],
            [1.70655640e09, 1.70655785e09],
            [1.70656248e09, 1.70656379e09],
            [1.70656855e09, 1.70656972e09],
        ]
    )


@pytest.fixture
def burstcube_ephem():
    # Define a TLE by hand
    satname = "ISS (ZARYA)"
    tle1 = "1 25544U 98067A   24003.59801929  .00015877  00000-0  28516-3 0  9995"
    tle2 = "2 25544  51.6422  55.8239 0003397 348.6159 108.6885 15.50043818432877"
    tleentry = TLEEntry(satname=satname, tle1=tle1, tle2=tle2)

    # Manually load this TLE
    tle = BurstCubeTLE(epoch=Time("2024-01-29"), tle=tleentry)

    stepsize = 60 * u.s

    # Calculate a BurstCube Ephemeris
    eph = BurstCubeEphem(
        begin=Time("2024-01-29"), end=Time("2024-01-30"), tle=tle.tle, stepsize=stepsize
    )
    return eph


@pytest.fixture
def burstcube_skyfield_saa():
    # Calculate BurstCube SAA passages using skyfield
    # from skyfield.api import load, wgs84, EarthSatellite, utc

    # ts = load.timescale()
    # satellite = EarthSatellite(tle1, tle2, satname, ts)
    # bodies = load("de421.bsp")
    # nowts = ts.from_datetimes([dt.replace(tzinfo=utc) for dt in eph.timestamp.datetime])
    # gcrs = satellite.at(nowts)
    # lat, lon = wgs84.latlon_of(gcrs)
    # skyfield_lat = lat.degrees
    # skyfield_lon = lon.degrees

    # # Define a manual SAA polygon
    # skyfield_saapoly = Polygon(
    #     [
    #         (33.900000, -30.0),
    #         (12.398, -19.876),
    #         (-9.103, -9.733),
    #         (-30.605, 0.4),
    #         (-38.4, 2.0),
    #         (-45.0, 2.0),
    #         (-65.0, -1.0),
    #         (-84.0, -6.155),
    #         (-89.2, -8.880),
    #         (-94.3, -14.220),
    #         (-94.3, -18.404),
    #         (-84.48631, -31.84889),
    #         (-86.100000, -30.0),
    #         (-72.34921, -43.98599),
    #         (-54.5587, -52.5815),
    #         (-28.1917, -53.6258),
    #         (-0.2095279, -46.88834),
    #         (28.8026, -34.0359),
    #         (33.900000, -30.0),
    #     ]
    # )

    # # Calculate a boolean array of when BurstCube is inside this polygon
    # skyfield_saa = skyfield_saapoly.contains(points(skyfield_lon, skyfield_lat))

    # # Construct start and end windows
    # skyfield_saa_windows = make_windows(skyfield_saa, eph.timestamp.unix)
    skyfield_saa_windows = np.array(
        [
            [1.70648724e09, 1.70648790e09],
            [1.70649264e09, 1.70649360e09],
            [1.70649828e09, 1.70649930e09],
            [1.70650392e09, 1.70650500e09],
            [1.70651028e09, 1.70651088e09],
            [1.70651130e09, 1.70651154e09],
            [1.70651634e09, 1.70651724e09],
            [1.70652210e09, 1.70652300e09],
            [1.70652786e09, 1.70652870e09],
            [1.70653362e09, 1.70653440e09],
            [1.70653944e09, 1.70653992e09],
            [1.70657082e09, 1.70657136e09],
        ]
    )
    return skyfield_saa_windows


@pytest.fixture
def target():
    return SkyCoord(120, 34, unit="deg")


@pytest.fixture
def swiftapi_visibility():
    # from swifttools.swift_too import VisQuery
    # target = SkyCoord(120,34,unit='deg')
    # swift_vis = VisQuery(skycoord=target,begin=Time("2024-01-29"), end=Time("2024-01-30"),hires=True)
    # swift_windows = np.array([(e.begin.timestamp(),e.end.timestamp())for e in swift_vis.entries])
    swift_windows = np.array(
        [
            [1.70649018e09, 1.70649174e09],
            [1.70649498e09, 1.70649744e09],
            [1.70650068e09, 1.70650314e09],
            [1.70650638e09, 1.70650884e09],
            [1.70651208e09, 1.70651454e09],
            [1.70651778e09, 1.70652018e09],
            [1.70652348e09, 1.70652588e09],
            [1.70652918e09, 1.70653158e09],
            [1.70653488e09, 1.70653728e09],
            [1.70654058e09, 1.70654298e09],
            [1.70654628e09, 1.70654868e09],
            [1.70655198e09, 1.70655438e09],
            [1.70655786e09, 1.70656008e09],
            [1.70656380e09, 1.70656578e09],
            [1.70656974e09, 1.70657148e09],
        ]
    )
    return swift_windows


@pytest.fixture
def swift_insaa(swift_ephem):
    return swift_saa_constraint(time=swift_ephem.timestamp, ephem=swift_ephem)


@pytest.fixture
def swift_saa_entries(swift_ephem, swift_insaa):
    return make_windows(swift_insaa, swift_ephem.timestamp)


@pytest.fixture
def swift_windows(swift_ephem, swift_insaa, target):
    swift_earth_occult = swift_earth_constraint(
        skycoord=target, time=swift_ephem.timestamp, ephem=swift_ephem
    )
    return make_windows(
        np.logical_not(swift_earth_occult | swift_insaa), swift_ephem.timestamp
    )


@pytest.fixture
def burstcube_insaa(burstcube_ephem):
    return burstcube_saa_constraint(
        time=burstcube_ephem.timestamp, ephem=burstcube_ephem
    )


@pytest.fixture
def burstcube_saa_windows(burstcube_ephem, burstcube_insaa):
    return make_windows(burstcube_insaa, burstcube_ephem.timestamp)


@pytest.fixture
def burstcube_windows(burstcube_ephem, target):
    burstcube_earth_occult = burstcube_earth_constraint(
        skycoord=target, time=burstcube_ephem.timestamp, ephem=burstcube_ephem
    )
    return make_windows(
        np.logical_not(burstcube_earth_occult),
        burstcube_ephem.timestamp,
    )


@pytest.fixture
def burstcube_skyfield_windows():
    # from skyfield.api import load, wgs84, EarthSatellite, utc
    # import numpy as np
    # from datetime import datetime, timedelta
    # import astropy.units as u
    # from astropy.coordinates import SkyCoord
    # from astropy.time import Time

    # satname = "ISS (ZARYA)"
    # tle1 = "1 25544U 98067A   24003.59801929  .00015877  00000-0  28516-3 0  9995"
    # tle2 = "2 25544  51.6422  55.8239 0003397 348.6159 108.6885 15.50043818432877"

    # # Compute GCRS position using Skyfield library

    # timestamps = [datetime(2024,1,29,tzinfo=utc)+timedelta(seconds=60*i) for i in range(1441)]

    # ts = load.timescale()
    # satellite = EarthSatellite(tle1, tle2, satname, ts)
    # bodies = load("de421.bsp")
    # nowts = ts.from_datetimes(timestamps)
    # earthpos = (bodies["Earth"] + satellite).at(nowts).observe(bodies["Earth"])
    # radec = earthpos.radec()
    # skyfield_earthra = radec[0]._degrees * u.deg
    # skyfield_earthdec = radec[1].degrees * u.deg
    # skyfield_earthdec

    # target = SkyCoord(120, 34, unit="deg")
    # earth = SkyCoord(skyfield_earthra, skyfield_earthdec)
    # inoccult = target.separation(earth).value < 70
    # make_windows(inoccult,Time(timestamps))

    return np.array(
        [
            [1.70648640e09, 1.70648844e09],
            [1.70649060e09, 1.70649402e09],
            [1.70649612e09, 1.70649960e09],
            [1.70650170e09, 1.70650512e09],
            [1.70650728e09, 1.70651070e09],
            [1.70651286e09, 1.70651628e09],
            [1.70651844e09, 1.70652186e09],
            [1.70652402e09, 1.70652744e09],
            [1.70652954e09, 1.70653302e09],
            [1.70653512e09, 1.70653860e09],
            [1.70654070e09, 1.70654412e09],
            [1.70654628e09, 1.70654970e09],
            [1.70655186e09, 1.70655528e09],
            [1.70655738e09, 1.70656086e09],
            [1.70656296e09, 1.70656644e09],
            [1.70656854e09, 1.70657202e09],
        ]
    )
