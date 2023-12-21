import astropy.units as u  # type: ignore
import numpy as np

from ..base.config import ConfigSchema

BURSTCUBE = {
    # Top level details about the mission
    "mission": {
        "name": "BurstCube",
        "shortname": "BurstCube",
        "agency": "NASA",
        "type": "CubeSat",
        "pi": "Jeremy Perkins",
        "description": "The first direct detections of Gravitational Waves (GWs) has brought astronomy into a new era of discovery. The   search for electromagnetic counterparts to GW sources is now more important than ever before. BurstCube will be a 6U CubeSat (10 cm x 20 cm x 30 cm) composed of 4 scintillator detectors read out by arrays of silicon photomultipliers. BurstCube will automatically detect gamma-ray transients onboard (astrophysical, solar, and terrestrial), sending rapid alerts to the ground to enable follow-up observations. BurstCube is currently in development and will lauch in the early 2020's.",
        "website": "https://asd.gsfc.nasa.gov/burstcube",
    },
    # Details about the Observatory instrument compliment
    "instruments": [
        {
            "name": "BurstCube",
            "shortname": "BurstCube",
            "description": "",
            "website": "https://smallsat.wff.nasa.gov/missions/burstcube.php",
            "energy_low": (50 * u.keV).value,
            "energy_high": (1 * u.MeV).to(u.keV).value,
            "fov": {
                "type": "all-sky",
                "area": (4 * np.pi * u.sr).to(u.deg**2).value,
                "dimension": None,
                "filename": "data/BAT_FOV_nside512.fits",
            },
        }
    ],
    # Ephemeris options for Observatory
    "ephem": {
        "parallax": False,  # Calculate parallax for Moon/Sun
        "apparent": True,  # Use apparent positions
        "velocity": False,  # Calculate Velocity of spacecraft (slower)
        "stepsize": 60,  # Stepsize
        "earth_radius": 70,  # Fix 70 degree Earth radius
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
        "tle_bad": 40,  # days
        "tle_name": "ISS (ZARYA)",
        "tle_url": "https://celestrak.org/NORAD/elements/gp.php?INTDES=1998-067",
        "tle_heasarc": None,
    },
}

# Validate config dict
burstcube_config = ConfigSchema.model_validate(BURSTCUBE)
