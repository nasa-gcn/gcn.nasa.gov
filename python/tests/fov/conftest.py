# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

import pytest
from across_api.across.resolve import Resolve
from astropy.coordinates import SkyCoord  # type: ignore[import]
from astropy.time import Time  # type: ignore[import]
from astropy.io import fits
from across_api.base.schema import TLEEntry
from across_api.burstcube.ephem import BurstCubeEphem
from across_api.burstcube.fov import BurstCubeFOV
from across_api.burstcube.tle import BurstCubeTLE
import astropy.units as u


@pytest.fixture
def AT2017gfo_skycoord():
    # Define the position of interesting event AT2017gfo
    r = Resolve(name="AT2017gfo")
    return SkyCoord(r.ra, r.dec, unit="deg")


@pytest.fixture
def AT2017gfo_healpix_probability():
    # Load the skymap of AT2017gfo and return the probability distribution
    hdu = fits.open("tests/gw170817_skymap.fits.gz")
    return hdu[1].data["PROB"]


@pytest.fixture
def burstcube_fov():
    # Define a TLE by hand. For the sake of this test, we're going to use the Fermi TLE on the day that GW170817 triggered.
    satname = "FGRST (GLAST)"
    tle1 = "1 33053U 08029A   17229.56317825 +.00000508 +00000-0 +12437-4 0  9995"
    tle2 = "2 33053 025.5829 306.0377 0012114 272.5539 087.3609 15.10926454506590"
    # Pretend we're Burstcube
    satname = "ISS (ZARYA)"

    tle = TLEEntry(satname=satname, tle1=tle1, tle2=tle2)

    # We use AT2017gfo as our trigger, so we use the time of that event
    trigger_time = Time("2017-08-17 12:41:06.47")

    # Manually load this TLE
    tle = BurstCubeTLE(epoch=trigger_time, tle=tle)

    # Calculate a BurstCube Ephemeris for the time around the trigger
    eph = BurstCubeEphem(
        begin=trigger_time - 2 * u.s,
        end=trigger_time + 2 * u.s,
        tle=tle.tle,
        stepsize=1 * u.s,
    )

    return BurstCubeFOV(ephem=eph, time=trigger_time)
