import astropy.units as u  # type: ignore
import numpy as np
from astropy.constants import c, h  # type: ignore

from ..base.config import ConfigSchema

SWIFT = {
    # Top level details about the mission
    "mission": {
        "name": "Neil Gehrels Swift Observatory",
        "shortname": "Swift",
        "agency": "NASA",
        "type": "Astrophysics Medium Explorer",
        "pi": "Brad Cenko",
        "description": "Swift is a first-of-its-kind multi-wavelength observatory dedicated to the study of gamma-ray burst (GRB) science.",
        "website": "https://swift.gsfc.nasa.gov/about_swift",
    },
    "instruments": [
        {
            "name": "Burst Alert Telescope",
            "shortname": "BAT",
            "description": "The Burst Alert Telescope (BAT) is a highly sensitive, large FOV instrument designed to provide critical GRB triggers and 4-arcmin positions. It is a coded aperture imaging instrument with a 1.4 steradian field-of-view (half coded). The energy range is 15-150 keV for imaging with a non-coded response up to 500 keV. Within several seconds of detecting a burst, the BAT calculates an initial position, decides whether the burst merits a spacecraft slew and, if so, sends the position to the spacecraft.",
            "website": "https://swift.gsfc.nasa.gov/about_swift/bat_desc.html",
            "energy_low": (15 * u.keV).value,
            "energy_high": (150 * u.keV).value,
            "fov": {
                "type": "healpix",
                "area": (1.4 * u.sr).to(u.deg**2).value,
                "dimension": None,
                "filename": "data/BAT_FOV_nside512.fits",
            },
        },
        {
            "name": "X-ray Telescope",
            "shortname": "XRT",
            "description": "The XRT is a sensitive, flexible, autonomous X-ray CCD imaging spectrometer designed to measure the position, spectrum, and brightness of gamma-ray bursts (GRBs) and afterglows over a wide dynamic range covering more than 7 orders of magnitude in flux.",
            "website": "https://www.swift.psu.edu/xrt/",
            "energy_low": (0.2 * u.keV).value,
            "energy_high": (10 * u.keV).value,
            "fov": {
                "type": "circular",  # Types: circular, square, polygon, healpix
                "area": np.pi * (11.8 / 60) ** 2,  # FOV area in sq deg.
                "dimension": 11.8 / 60.0,  # 17 arc-minutes radius,
                "filename": "",
            },
        },
        {
            "name": "UltraViolet/Optical Telescope",
            "shortname": "UVOT",
            "description": "The UVOT is a 30 cm modified Ritchey-Chretien UV/optical telescope CO-aligned with the X-ray Telescope and mounted on the telescope platform common to all instruments. An 11-position filter wheel allows low-resolution grism spectra of bright GRBs, magnification, and broad-band UV/visible photometry. Photons register on a microchannel plate intensified CCD (MIC).",
            "website": "https://www.swift.psu.edu/uvot/",
            "energy_low": (h * c / (650 * u.nm)).to(u.keV).value,
            "energy_high": (h * c / (170 * u.nm)).to(u.keV).value,
            "fov": {
                "type": "square",
                "area": (17 / 60) ** 2,
                "dimension": 17 / 60.0,  # 17 arc-minutes on the side,
                "filename": "",
                "boresight": {
                    "ra_off": -0.01327092778,
                    "dec_off": -0.004668194444,
                    "roll_off": 118.61,
                },
            },
        },
    ],
    # Ephemeris options
    "ephem": {
        "parallax": True,  # Calculate parallax for Moon/Sun
        "apparent": True,  # Use apparent positions for Moon/Sun
        "velocity": True,  # Calculate Velocity of spacecraft (slower, but needed for pole, ram constraints)
        "stepsize": 60,  # Stepsize
    },
    # Visibility constraint calculation defaults. i.e. what constraints should be considered
    "visibility": {
        # Constraint switches, set to True to calculate this constraint
        "earth_cons": True,  # Calculate Earth Constraint
        "moon_cons": True,  # Calculate Moon Constraint
        "sun_cons": True,  # Calculate Sun Constraint
        "ram_cons": False,  # Calculate Ram Constraint
        "pole_cons": False,  # Calcualte Orbit Pole Constraint
        "saa_cons": True,  # Calculate time in SAA as a constraint
        "ram_cons": False,  # Calculate Ram Constraint
        # Constraint avoidance values
        "earthoccult": 28,  # How many degrees from Earth Limb can you look?
        "moonoccult": 22,  # degrees from center of Moon
        "sunoccult": 46,  # degrees from center of Sun
        "ramsize": 10,  # degrees from center of ram direction
        "sunextra": 1,  # degrees buffer used for planning purpose
        "earthextra": 5,  # degrees buffer used for planning purpose
        "moonextra": 1,  # degrees buffer used for planning purpose
        "ramextra": 0,  # degrees buffer used for planning purpose
    },
    # Information on where to obtain a TLE for this Observatory
    "tle": {
        "tle_bad": 4,  # days
        "tle_url": None,
        "tle_name": "SWIFT",
        "tle_heasarc": "https://www.swift.ac.uk/about/status_files/tle",
        "tle_celestrak": "https://celestrak.org/NORAD/elements/gp.php?INTDES=2004-047",
    },
}

# Validate Config Dict
swift_config = ConfigSchema.model_validate(SWIFT)
