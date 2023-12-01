import astropy.units as u  # type: ignore
import numpy as np

from ..base.config import ConfigSchema

NICER = {
    # Top level details about the mission
    "mission": {
        "name": "Neutron star Interior Composition ExploreR",
        "shortname": "NICER",
        "agency": "NASA",
        "type": "Astrophysics Mission of Opportunity",
        "pi": "Keith Gendreau",
        "description": "Astrophysics on the International Space Station - Understanding ultra-dense matter through soft X-ray timing",
        "website": "https://heasarc.gsfc.nasa.gov/docs/nicer/nicer_about.html",
    },
    "instruments": [
        {
            "name": "X-ray Timing Instrument",
            "shortname": "XTI",
            "description": "X-ray (0.2-12 keV) 'concentrator' optics and silicon-drift detectors. GPS position and absolute time reference to better than 300 ns.",
            "website": "https://heasarc.gsfc.nasa.gov/docs/nicer/nicer_about.html",
            "energy_low": (0.2 * u.keV).value,
            "energy_high": (12 * u.keV).value,
            "fov": {
                "type": "circular",
                "area": ((5 / 60 / 2) ** 2 * np.pi * u.deg**2).value,
                "dimension": 5 / 60 / 2,  # 5' diameter = 2.5' radius
                "filename": None,
            },
        }
    ],
    # Ephemeris options
    "ephem": {
        "parallax": False,  # Calculate parallax for Moon/Sun
        "apparent": True,  # Use apparent positions for Moon/Sun
        "velocity": False,  # Calculate Velocity of spacecraft (slower)
        "stepsize": 60,  # Stepsize
    },
    # Visibility constraint calculation defaults. i.e. what constraints should be considered
    "visibility": {
        # Constraint switches, set to True to calculate this constraint
        "earth_cons": True,  # Calculate Earth Constraint
        "moon_cons": False,  # Calculate Moon Constraint
        "sun_cons": False,  # Calculate Sun Constraint
        "ram_cons": False,  # Calculate Ram Constraint
        "pole_cons": False,  # Calcualte Orbit Pole Constraint
        "saa_cons": True,  # Calculate time in SAA as a constraint
        # Constraint avoidance values
        "earthoccult": 0,  # How many degrees from Earth Limb can you look?
        "moonoccult": 0,  # degrees from center of Moon
        "sunoccult": 0,  # degrees from center of Sun
        "sunextra": 0,  # degrees buffer used for planning purpose
        "earthextra": 0,  # degrees buffer used for planning purpose
        "moonextra": 0,  # degrees buffer used for planning purpose
    },
    # Information on where to obtain a TLE for this Observatory
    "tle": {
        "tle_bad": 4,  # days
        "tle_url": None,  # "http://live.ariss.org/iss.txt",
        "tle_name": "ISS (ZARYA)",
        "tle_heasarc": None,
        "tle_celestrak": "https://celestrak.org/NORAD/elements/gp.php?INTDES=1998-067",
    },
}

# Validate Config Dict
nicer_config = ConfigSchema.model_validate(NICER)
