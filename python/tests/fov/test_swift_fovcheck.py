import astropy.units as u
from across_api.across.resolve import Resolve
from across_api.base.schema import TLEEntry
from across_api.swift.ephem import SwiftEphem
from across_api.swift.fov import SwiftFOV
from across_api.base.pointing import PointingBase
from across_api.swift.tle import SwiftTLE
from astropy.coordinates import SkyCoord, angular_separation
from astropy.io import fits
from astropy.time import Time

# Define a TLE by hand. For the sake of this test, we're going to use the Fermi TLE on the day that GW170817 triggered.
satname = "SWIFT"
tle1 = "1 28485U 04047A   24029.43721350  .00012795  00000-0  63383-3 0  9994"
tle2 = "2 28485  20.5570  98.6682 0008279 273.6948  86.2541 15.15248522 52921"
tleentry = TLEEntry(satname=satname, tle1=tle1, tle2=tle2)

tle = TLEEntry(satname=satname, tle1=tle1, tle2=tle2)

# We use AT2017gfo as our trigger, so find the coordinates of that event
r = Resolve(name="AT2017gfo")
trigger_time = Time("2017-08-17 12:41:06.47")
skycoord = SkyCoord(r.ra, r.dec, unit="deg")

# Manually load this TLE
tle = SwiftTLE(epoch=trigger_time, tle=tle)

# Calculate a BurstCube Ephemeris for the time around the trigger
eph = SwiftEphem(
    begin=trigger_time - 2 * u.s,
    end=trigger_time + 2 * u.s,
    tle=tle.tle,
    stepsize=1 * u.s,
)

# Compute the position ot the Earth at the time of GW170817 using skyfield
# from skyfield.api import load, wgs84, EarthSatellite, utc

# ts = load.timescale()
# satellite = EarthSatellite(tle1, tle2, satname, ts)
# bodies = load("de421.bsp")
# nowts = ts.from_datetime(trigger_time.datetime.replace(tzinfo=utc))
# earthpos = (bodies["Earth"] + satellite).at(nowts).observe(bodies["Earth"])
# radec = earthpos.radec()
# skyfield_earthra = radec[0]._degrees * u.deg
# skyfield_earthdec = radec[1].degrees * u.deg

skyfield_earthra = 297.96021 * u.deg
skyfield_earthdec = -3.8946682 * u.deg


def test_swift_fov_point_source():
    """Skyfield calculation of Earth Occultation and ACROSS API should give the same answer."""
    # Assert that the skyfield calculated Earth position is > 70 degrees from
    # the trigger location, i.e. not occulted
    assert (
        angular_separation(
            skyfield_earthra, skyfield_earthdec, skycoord.ra, skycoord.dec
        )
        > 70 * u.deg
    ), "This trigger should be not earth occulted"
    # Perform the same calculation using the ACROSS API BurstCubeFOV class.
    # Should report True if the trigger was in the FOV.
    fov = SwiftFOV(
        pointing=PointingBase(
            ra=skycoord.ra.value, dec=skycoord.dec.value, position_angle=0
        )
    )
    assert (
        fov.probability_in_fov(skycoord=skycoord) == 1.0  # noqa: E712
    ), "SwiftFOV should report this trigger as outside of Earth Occultation"


def test_swift_fov_error():
    """Check that for a circular error box of radius 20 degrees, the infov
    fraction of the probability is 0.92439."""
    fov = SwiftFOV(
        pointing=PointingBase(
            ra=skycoord.ra.value, dec=skycoord.dec.value, position_angle=0
        )
    )
    in_fov_prob = fov.probability_in_fov(skycoord=skycoord, error_radius=1 * u.deg)
    assert in_fov_prob == 0.03687


def test_swift_fov_healpix():
    hdu = fits.open("tests/gw170817_skymap.fits.gz")
    healpix = hdu[1].data["PROB"]
    fov = SwiftFOV(
        pointing=PointingBase(
            ra=skycoord.ra.value, dec=skycoord.dec.value, position_angle=0
        )
    )
    in_fov_prob = fov.probability_in_fov(healpix_loc=healpix)
    assert (
        in_fov_prob == 0.0193
    ), "0.0193% of the probability of GW170817 should be inside the FOV for swift"
