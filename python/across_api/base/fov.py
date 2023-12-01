from datetime import datetime
from typing import Optional, Union

import astropy.units as u  # type: ignore
import astropy_healpix as ah  # type: ignore
import numpy as np
from astropy.coordinates import CartesianRepresentation  # type: ignore
from astropy.coordinates import Latitude, Longitude, SkyCoord
from astropy.coordinates.matrix_utilities import rotation_matrix  # type: ignore
from astropy.io import fits  # type: ignore
from erfa import pdp  # type: ignore
from fastapi import HTTPException

from ..functions import round_time
from .common import ACROSSAPIBase
from .ephem import EphemBase
from .pointing import PointingBase
from .schema import ConfigSchema, FOVOffsetSchema, JobInfo, PointBase


class FOVBase(ACROSSAPIBase):
    boresight: Optional[FOVOffsetSchema]

    def point(
        self,
        sc_ra: Optional[float] = None,
        sc_dec: Optional[float] = None,
        sc_roll: Optional[float] = None,
    ) -> bool:
        """
        Set the pointing direction of the spacecraft.

        Parameters
        ----------
        sc_ra : Optional[float], optional
            Spacecraft pointing Right Ascension in decimal degrees, by default None
        sc_dec : Optional[float], optional
            Spacecraft pointing Declination in decimal degrees, by default None
        sc_roll : Optional[float], optional
            Spacecraft pointing Roll in decimal degrees, by default None

        Returns
        -------
        bool
            _description_
        """
        self.sc_ra = sc_ra
        self.sc_dec = sc_dec
        self.sc_roll = sc_roll

        # Do a correction for the alignment between the spacecraft and instrument
        if (
            self.boresight is not None
            and self.sc_ra is not None
            and self.sc_dec is not None
            and self.sc_roll is not None
        ):
            # Apply the instrument roll offset
            self.sc_roll += self.boresight.roll_off % 360

        return True

    @property
    def sc_skycoord(self) -> Optional[SkyCoord]:
        """
        Return the spacecraft pointing as a SkyCoord object.

        Returns
        -------
        SkyCoord
            Spacecraft pointing
        """
        if self.sc_ra is not None and self.sc_dec is not None:
            return SkyCoord(ra=self.sc_ra, dec=self.sc_dec, unit="deg")
        return None

    @sc_skycoord.setter
    def sc_skycoord(self, skycoord: SkyCoord):
        """
        Set the spacecraft pointing from a SkyCoord object.

        Parameters
        ----------
        skycoord: SkyCoord
            Spacecraft pointing
        """
        self.sc_ra = skycoord.ra.deg
        self.sc_dec = skycoord.dec.deg

    def radec2body(
        self,
        ra: Union[float, list, np.ndarray],
        dec: Union[float, list, np.ndarray],
        rollsign: float = -1,
    ) -> tuple:
        """
        For a given RA/Dec value, return the spacecraft body coordinates for that part of the FOV.

        Parameters
        ----------
        ra : float
            Right Ascenscion ICRS decimal degrees
        dec : float
            Declination ICRS decimal degrees

        Returns
        -------
        np.ndarray
            Spacecraft body coordinates
        """
        if self.sc_roll is not None and self.sc_skycoord is not None:
            # Create a rotation matrix to transform the coordinates
            # into spacecraft body coordinates
            sc_rotation = (
                np.diag([1.0, 1.0, 1.0])
                @ rotation_matrix(rollsign * self.sc_roll * u.deg, "x")
                @ rotation_matrix(-self.sc_skycoord.dec, "y")
                @ rotation_matrix(self.sc_skycoord.ra, "z")
            )

            # Perform a matrix rotation to convert the coordinates
            # into spacecraft body coordinates
            bodycoord = SkyCoord(
                CartesianRepresentation(
                    pdp(
                        sc_rotation,
                        SkyCoord(ra, dec, unit="deg").cartesian.xyz.value,
                    )
                )
            )

            bodyra = bodycoord.ra.deg
            bodydec = bodycoord.dec.deg

            if self.boresight is not None:
                # Apply the instrument offset
                # FIXME: Should apply shift properly, to avoid wrapping issues,
                # right now only works if FOV is << 180 degrees
                bodyra -= self.boresight.ra_off
                bodydec -= self.boresight.dec_off
            return bodyra, bodydec
        # If required parameters are not set, just assume no visibility
        return None, None

    def earth_occulted(
        self,
        ra: Union[float, list, np.ndarray, Latitude, None] = None,
        dec: Union[float, list, np.ndarray, Longitude, None] = None,
        skycoord: Optional[SkyCoord] = None,
        earth: Optional[SkyCoord] = None,
        earth_ra: Optional[float] = None,
        earth_dec: Optional[float] = None,
        earth_size: Union[float, u.Quantity, None] = None,
    ) -> Union[bool, np.ndarray]:
        """
        Check if a celestial object is occulted by the Earth.

        Parameters
        ----------
        ra : float, list, np.ndarray, Latitude, None
            Right ascension of the celestial object.
        dec : float, list, np.ndarray, Longitude, None
            Declination of the celestial object.
        skycoord: SkyCoord, optional
            SkyCoord object representing the celestial object.
        earth : SkyCoord, optional
            SkyCoord object representing the Earth.
        earth_ra : float, optional
            Right ascension of the Earth.
        earth_dec : float, optional
            Declination of the Earth.
        earth_size : float, u.Quantity, None
            Angular size of the Earth.

        Returns
        -------
        bool or np.ndarray
            True if the celestial object is occulted by the Earth, False otherwise.
        """
        if ra is not None and dec is not None:
            skycoord = SkyCoord(ra, dec, unit="deg")
        if earth_ra is not None and earth_dec is not None:
            earth = SkyCoord(earth_ra, earth_dec, unit="deg")
        if type(earth_size) is not u.Quantity and earth_size is not None:
            earth_size = earth_size * u.deg
        if earth is not None and earth_size is not None and skycoord is not None:
            return skycoord.separation(earth) < earth_size
        return False

    def infov(
        self,
        ra: Optional[float] = None,
        dec: Optional[float] = None,
        skycoord: Optional[SkyCoord] = None,
        earth_ra: Optional[float] = None,
        earth_dec: Optional[float] = None,
        earth: Optional[SkyCoord] = None,
        earth_size: Union[float, u.Quantity, None] = None,
    ) -> Union[bool, np.ndarray]:
        """
        Given the current spacecraft pointing, is the target at the
        given coordinates inside the FOV and not Earth occulted. Note
        that this method only checks for Earth occultation, so defines
        a simple 'all-sky' FOV with no other constraints.

        Parameters
        ----------
        ra : float
            Right Asc_enscion ICRS decimal degrees
        dec : float
            Declination ICRS decimal degrees
        skycoord: SkyCoord, optional
            SkyCoord object representing the celestial object.
        earth : SkyCoord, optional
            SkyCoord object representing the Earth.
        earth_ra : float, optional
            Right ascension of the Earth.
        earth_dec : float, optional
            Declination of the Earth.
        earth_size : float, u.Quantity, None
            Angular size of the Earth (default degrees if float).

        Returns
        -------
        bool
            True or False
        """
        # Check for Earth occultation
        earth_occultation = self.earth_occulted(
            ra=ra,
            dec=dec,
            skycoord=skycoord,
            earth=earth,
            earth_ra=earth_ra,
            earth_dec=earth_dec,
            earth_size=earth_size,
        )
        return np.logical_not(earth_occultation)

    def infov_hp(
        self,
        healpix_loc: np.ndarray,
        healpix_nside: Optional[int] = None,
        healpix_order: str = "NESTED",
        earth_ra: Optional[float] = None,
        earth_dec: Optional[float] = None,
        earth_size: Optional[float] = None,
    ) -> float:
        """
        Calculates the amount of probability inside the field of view (FOV) defined by the given parameters.

        Parameters
        ----------
        healpix_loc : np.ndarray
            An array containing the probability density values for each HEALpix
            pixel.
        healpix_nside : int
            The NSIDE value of the HEALpix map. If not provided, it will be
            calculated based on the length of healpix_loc.
        healpix_order : str
            The ordering scheme of the HEALpix map. Default is "NESTED".
        earth_ra : float
            The right ascension of the Earth's center in degrees. If provided
            along with earth_dec and earth_size, it will be used to remove
            Earth occulted pixels from the FOV.
        earth_dec : float
            The declination of the Earth's center in degrees.
        earth_size : float
            The size of the Earth in degrees.

        Returns
        -------
        float
            The amount of probability inside the FOV.

        Note:
        - This method assumes that the spacecraft's pointing direction is defined by self.sc_ra and self.sc_dec attributes.
        - If self.sc_ra or self.sc_dec is None, it returns 0.
        - If healpix_order is "NUNIQ", it assumes that healpix_loc contains UNIQ values and converts them to level and ipix values.
        - If earth_ra, earth_dec, and earth_size are provided, it removes Earth occulted pixels from the FOV before calculating the probability.
        """
        # Check if we're pointing
        if self.sc_ra is None or self.sc_dec is None:
            return 0

        # Check if this is a MOC map
        if healpix_order == "NUNIQ":
            level, ipix = ah.uniq_to_level_ipix(healpix_loc["UNIQ"])
            healpix_nside = ah.level_to_nside(level)
            healpix_loc = healpix_loc["PROBDENSITY"]

        # Calculate the HEALpix NSIDE value
        if healpix_nside is None:
            healpix_nside = ah.npix_to_nside(len(healpix_loc))

        # Find where in HEALpix map the probability is > 0
        nonzero_prob_pixels = np.where(healpix_loc > 0.0)[0]

        # Create a list of RA/Dec coordinates for these pixels
        if healpix_order == "NUNIQ":
            ra, dec = ah.healpix_to_lonlat(
                ipix[nonzero_prob_pixels],
                nside=healpix_nside[nonzero_prob_pixels],  # type: ignore
                order="NESTED",
            )
        else:
            ra, dec = ah.healpix_to_lonlat(
                nonzero_prob_pixels, nside=healpix_nside, order=healpix_order
            )

        # Convert these coordinates into a SkyCoord
        skycoord = SkyCoord(ra=ra, dec=dec, unit="deg")

        # Remove pixels that are Earth occulted
        if earth_ra is not None and earth_dec is not None and earth_size is not None:
            # Earth coordinate skycoord
            earth_skycoord = SkyCoord(ra=earth_ra, dec=earth_dec, unit="deg")
        else:
            earth_skycoord = None

        # Calculate pixel values of the all the regions inside of the FOV
        visible_pixels = nonzero_prob_pixels[
            self.infov(skycoord=skycoord, earth=earth_skycoord, earth_size=earth_size)
        ]

        if healpix_order == "NUNIQ":
            # Calculate probability in FOV by multiplying the probability density by
            # area of each pixel and summing up
            pixarea = ah.nside_to_pixel_area(healpix_nside[visible_pixels])  # type: ignore
            return float(round(np.sum(healpix_loc[visible_pixels] * pixarea.value), 5))
        else:
            # Calculate the amount of probability inside the FOV
            return float(round(np.sum(healpix_loc[visible_pixels]), 5))


class HealFOV(FOVBase):
    """
    Class that defines an instrument FOV using a healpix map. Designed
    for instruments that have very large fields of view, where we can
    define them using a healpix map.
    """

    sc_ra: Optional[float]
    sc_dec: Optional[float]
    sc_roll: Optional[float]
    healmap: Optional[np.ndarray]
    healmapfile: Optional[str]
    nest: str
    nside: int

    def __init__(
        self,
        sc_ra: Optional[float] = None,
        sc_dec: Optional[float] = None,
        sc_roll: Optional[float] = None,
        healmap: Optional[np.ndarray] = None,
        healmapfile: Optional[str] = None,
        ordering: str = "NESTED",
        nside: int = 512,
        boresight: Optional[FOVOffsetSchema] = None,
    ):
        if healmap is not None:
            self.healmap = healmap
        if healmapfile is not None:
            self.read_healpix_fits(healmapfile)
        self.boresight = boresight
        self.nside = nside
        self.ordering = ordering
        self.sc_ra = sc_ra
        self.sc_dec = sc_dec
        self.sc_roll = sc_roll
        # Minimum good value to be considered inside FOV
        self.mingood = 0

    def read_healpix_fits(self, filename: str) -> bool:
        """Load in healpix FOV file

        Parameters
        ----------
        filename : str
            Healpix FITS file to load

        Returns
        -------
        bool
            Did this work? True | False
        """
        hdu = fits.open(filename)
        self.nside = hdu[1].header["NSIDE"]
        self.ordering = hdu[1].header["ORDERING"]
        self.healmap = np.concatenate(hdu[1].data, axis=1)[0]
        return True

    def collecting_area_ra_dec(self, ra: float, dec: float) -> float:
        """
        For a given RA/Dec value, return the collecting area value for that part of the FOV.

        Parameters
        ----------
        ra : float
            Right Asc_enscion ICRS decimal degrees
        dec : float
            Declination ICRS decimal degrees

        Returns
        -------
        float
            Collecting area in units of cm**2
        """
        # Figure out the corresponding body coordinates
        bodyra, bodydec = self.radec2body(ra, dec)

        # Fetch and return the value from this healpix map
        # FIXME: Should be doing some sort of interpolation?
        if bodyra is not None and bodydec is not None:
            pix = ah.lonlat_to_healpix(
                bodyra * u.deg, bodydec * u.deg, nside=self.nside, order=self.ordering
            )

            return self.healmap[pix]  # type: ignore
        # If required parameters are not set, just assume no visibility
        return 0

    def infov(
        self,
        ra: Optional[float] = None,
        dec: Optional[float] = None,
        skycoord: Optional[SkyCoord] = None,
        earth_ra: Optional[float] = None,
        earth_dec: Optional[float] = None,
        earth: Optional[SkyCoord] = None,
        earth_size: Union[float, u.Quantity, None] = None,
    ) -> Union[bool, np.ndarray]:
        """Is given the current spacecraft pointing, is the target at the
        given coordinates inside the FOV.

        Parameters
        ----------
        ra : float
            Right Asc_enscion ICRS decimal degrees
        dec : float
            Declination ICRS decimal degrees
        skycoord: SkyCoord, optional
            SkyCoord object representing the celestial object.
        earth : SkyCoord, optional
            SkyCoord object representing the Earth.
        earth_ra : float, optional
            Right ascension of the Earth.
        earth_dec : float, optional
            Declination of the Earth.
        earth_size : float, u.Quantity, None
            Angular size of the Earth (default degrees if float).

        Returns
        -------
        bool
            True or False
        """
        # Check for Earth occultation
        earth_occultation = self.earth_occulted(
            ra=ra,
            dec=dec,
            skycoord=skycoord,
            earth=earth,
            earth_ra=earth_ra,
            earth_dec=earth_dec,
            earth_size=earth_size,
        )

        # Extract ra/dec from SkyCoord if not provided
        if skycoord is not None:
            ra = skycoord.ra.deg
            dec = skycoord.dec.deg

        if ra is not None and dec is not None:
            infov = self.collecting_area_ra_dec(ra, dec) > self.mingood
        else:
            infov = False

        return infov * np.logical_not(earth_occultation)


class CircularFOV(FOVBase):
    """
    Class that defines an instrument FOV using a circular FOV
    of a given radius.

    Parameters
    ----------
    radius : float
        Radius of the FOV in decimal degrees
    sc_ra : float
        Spacecraft pointing Right Ascension in decimal degrees
    sc_dec : float
        Spacecraft pointing Right Ascension in decimal degrees
    sc_roll : float
        Spacecraft pointing Right Ascension in decimal degrees
    """

    def __init__(
        self,
        sc_ra: Optional[float] = None,
        sc_dec: Optional[float] = None,
        sc_roll: Optional[float] = None,
        radius: Union[float, u.Quantity, None] = None,
        boresight: Optional[FOVOffsetSchema] = None,
    ):
        self.radius = radius
        self.sc_ra = sc_ra
        self.sc_dec = sc_dec
        self.sc_roll = sc_roll
        self.boresight = boresight

    def infov(
        self,
        ra: Optional[float] = None,
        dec: Optional[float] = None,
        skycoord: Optional[SkyCoord] = None,
        earth_ra: Optional[float] = None,
        earth_dec: Optional[float] = None,
        earth: Optional[SkyCoord] = None,
        earth_size: Union[float, u.Quantity, None] = None,
    ) -> Union[bool, np.ndarray]:
        """Is given the current spacecraft pointing, is the target at the
        given coordinates inside the FOV.

        Parameters
        ----------
        ra : float
            Right Asc_enscion ICRS decimal degrees
        dec : float
            Declination ICRS decimal degrees
        skycoord: SkyCoord, optional
            SkyCoord object representing the celestial object.
        earth : SkyCoord, optional
            SkyCoord object representing the Earth.
        earth_ra : float, optional
            Right ascension of the Earth.
        earth_dec : float, optional
            Declination of the Earth.
        earth_size : float, u.Quantity, None
            Angular size of the Earth (default degrees if float).

        Returns
        -------
        bool
            True or False
        """
        # Check for Earth occultation
        earth_occultation = self.earth_occulted(
            ra=ra,
            dec=dec,
            skycoord=skycoord,
            earth=earth,
            earth_ra=earth_ra,
            earth_dec=earth_dec,
            earth_size=earth_size,
        )

        # Convert radius float to astropy Quantity in degrees
        if type(self.radius) is float:
            radius = self.radius * u.deg
        else:
            radius = self.radius

        # If we're not pointing, then return False
        if self.sc_skycoord is None:
            return False

        # Position SkyCoord
        if skycoord is None:
            skycoord = SkyCoord(ra=ra, dec=dec, unit="deg")

        # See if the target is inside the FOV and not Earth occulted
        return self.sc_skycoord.separation(skycoord).deg < radius * np.logical_not(
            earth_occultation
        )


class AllSkyFOV(FOVBase):
    """
    All sky instrument FOV.
    """

    def __init__(self, **kwargs):
        self.boresight = None
        pass


class SquareFOV(FOVBase):
    """
    Class that defines an instrument FOV using a square FOV
    of a given FOV size, which is defined as the angular extent of
    one side of the square.

    Parameters
    ----------
    size : float
        angular size of the square FOV in decimal degrees,
        this is the angular size of one side of the square.
    sc_ra : float
        Spacecraft pointing Right Ascension in decimal degrees
    sc_dec : float
        Spacecraft pointing Right Ascension in decimal degrees
    sc_roll : float
        Spacecraft pointing Right Ascension in decimal degrees
    """

    def __init__(
        self,
        size: float,
        sc_ra: Optional[float] = None,
        sc_dec: Optional[float] = None,
        sc_roll: Optional[float] = None,
        boresight: Optional[FOVOffsetSchema] = None,
    ):
        self.size = size
        self.sc_ra = sc_ra
        self.sc_dec = sc_dec
        self.sc_roll = sc_roll
        self.boresight = boresight

    def infov(
        self,
        ra: Optional[float] = None,
        dec: Optional[float] = None,
        skycoord: Optional[SkyCoord] = None,
        earth_ra: Optional[float] = None,
        earth_dec: Optional[float] = None,
        earth: Optional[SkyCoord] = None,
        earth_size: Union[float, u.Quantity, None] = None,
    ) -> Union[bool, np.ndarray]:
        """
        Given the current spacecraft pointing, is the target at the
        given coordinates inside the FOV and not Earth occulted. This
        defines a square FOV.

        Parameters
        ----------
        ra : float
            Right Asc_enscion ICRS decimal degrees
        dec : float
            Declination ICRS decimal degrees
        skycoord: SkyCoord, optional
            SkyCoord object representing the celestial object.
        earth : SkyCoord, optional
            SkyCoord object representing the Earth.
        earth_ra : float, optional
            Right ascension of the Earth.
        earth_dec : float, optional
            Declination of the Earth.
        earth_size : float, u.Quantity, None
            Angular size of the Earth (default degrees if float).

        Returns
        -------
        bool
            True or False
        """
        # Check for Earth occultation
        earth_occultation = self.earth_occulted(
            ra=ra,
            dec=dec,
            skycoord=skycoord,
            earth=earth,
            earth_ra=earth_ra,
            earth_dec=earth_dec,
            earth_size=earth_size,
        )

        # If we're not pointing, then return False
        if self.sc_skycoord is None:
            return False

        # Use sc
        if skycoord is not None:
            ra = skycoord.ra.deg
            dec = skycoord.dec.deg

        # Convert astropy Latitude/Longitude to float
        if type(ra) is Latitude:
            ra = ra.deg
        if type(dec) is Longitude:
            dec = dec.deg

        # Calculate the pointing in spacecraft body coordinates
        if ra is not None and dec is not None:
            bodyra, bodydec = self.radec2body(ra, dec)
        else:
            return False

        # Correct ra to be between -180 and 180
        if hasattr(bodyra, "__len__"):
            bodyra[np.where(bodyra > 180)] -= 360
        elif bodyra > 180:
            bodyra -= 360

        # Calculate the corners of the FOV
        fov = np.array(
            [
                [
                    -self.size / 2,
                    -self.size / 2,
                ],
                [
                    +self.size / 2,
                    -self.size / 2,
                ],
                [
                    +self.size / 2,
                    +self.size / 2,
                ],
                [
                    -self.size / 2,
                    +self.size / 2,
                ],
            ]
        )

        # Check if the target is inside the FOV
        visible = (
            (bodyra >= fov[0, 0])
            * (bodyra <= fov[1, 0])
            * (bodydec >= fov[0, 1])
            * (bodydec <= fov[3, 1])
        )

        return visible * np.logical_not(earth_occultation)


class FOVCheckBase(ACROSSAPIBase):
    """
    Base class for FOV check classes.

    Attributes
    ----------
    fov : FOVBase
        Instrument FOV
    ephem : EphemBase
        Ephemeris
    ra : float
        Right Ascension in decimal degrees
    dec : float
        Declination in decimal degrees
    pointings : PointingBase
        Pointing information
    earthoccult : bool
        Calculate Earth occultation (default: True)
    stepsize : int
        Step size in seconds for visibility calculations
    entries : list
        List of FOV check entries
    status : JobInfo
        Status of FOV check query
    config : ConfigSchema
        Configuration schema
    instrument : str
        Instrument name
    healpix_loc : np.ndarray
        HEALpix map
    healpix_order : str
        HEALpix ordering scheme
    """

    ephem: EphemBase
    ra: Optional[float]
    dec: Optional[float]
    healpix_loc: Optional[np.ndarray]
    healpix_order: str
    pointings: PointingBase
    earthoccult: bool
    stepsize: int
    entries: list
    config: ConfigSchema
    instrument: str
    status: JobInfo

    def get(self):
        """
        Calculate list of spacecraft pointings for a given date range.

        Returns
        -------
        bool
            True
        """
        # FIXME: Should parallelize this?
        for point in self.entries:
            # Where are we in the ephemeris?
            ephindex = self.ephem.ephindex(point.time)

            # Calculate the Earth RA/Dec and size at this time
            if self.earthoccult:
                earth_ra = self.ephem.earth_ra[ephindex]
                earth_dec = self.ephem.earth_dec[ephindex]
                earth_size = self.ephem.earthsize[ephindex]
            else:
                earth_ra = None
                earth_dec = None
                earth_size = None

            # Set the Spacecraft pointing direction
            self.fov.point(point.ra, point.dec, point.roll)

            # If we gave a HEALpix map, calculate the probability inside the FOV
            if self.healpix_loc is not None:
                point.infov = self.fov.infov_hp(
                    healpix_loc=self.healpix_loc,
                    healpix_order=self.healpix_order,
                    earth_ra=earth_ra,
                    earth_dec=earth_dec,
                    earth_size=earth_size,
                )
            else:
                # Is the target inside the FOV?
                point.infov = self.fov.infov(
                    self.ra, self.dec, earth_ra, earth_dec, earth_size
                )

    def infov(self, trigger_time: datetime) -> Union[bool, PointBase]:
        """
        Is given the current spacecraft pointing, is the target at the
        given coordinates inside the FOV.

        Parameters
        ----------
        trigger_time : datetime
            Time at which to calculate if we're in FOV

        Returns
        -------
        bool
            True or False
        """
        if len(self.entries) > 0:
            try:
                index = [p.time for p in self.entries].index(
                    round_time(trigger_time, self.stepsize)
                )
            except ValueError:
                raise HTTPException(status_code=404, detail="No entry for this time")
            return self.entries[index]
        return False

    @property
    def fov(self) -> FOVBase:
        """
        Set the FOV type based on the FOV schema

        Parameters
        ----------
        fovschema : FOVSchema
            FOV schema

        Returns
        -------
        FOVBase
            FOV class
        """
        if hasattr(self, "_fov"):
            return self._fov
        else:
            self._fov: FOVBase
            # Extract the fovschema for the given instrument from config
            fovschema = [
                i.fov for i in self.config.instruments if i.shortname == self.instrument
            ][0]

            if fovschema.type == "healpix":
                self._fov = HealFOV(
                    healmapfile=fovschema.filename, boresight=fovschema.boresight
                )
            elif fovschema.type == "circular":
                self._fov = CircularFOV(
                    radius=fovschema.dimension, boresight=fovschema.boresight
                )
            elif fovschema.type == "all-sky":
                self._fov = AllSkyFOV()
            elif fovschema.type == "square" and fovschema.dimension is not None:
                self._fov = SquareFOV(
                    size=fovschema.dimension, boresight=fovschema.boresight
                )
            else:
                raise ValueError(f"Unknown FOV type: {fovschema.type}")

        return self._fov
