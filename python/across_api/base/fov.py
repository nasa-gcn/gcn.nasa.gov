# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from typing import Optional, Union
import astropy_healpix as ah  # type: ignore
import astropy.units as u  # type: ignore
from astropy.io.fits import FITS_rec  # type: ignore
from scipy import stats  # type: ignore[import]
import numpy as np
from astropy.coordinates import SkyCoord, spherical_to_cartesian  # type: ignore
from astropy.time import Time  # type: ignore
import healpy as hp  # type: ignore[import]
from .constraints import EarthLimbConstraint, get_slice
from .footprint import Footprint
from .pointing import PointingBase
from .ephem import EphemBase

HEALPIX_MAP_EVAL_ORDER = 9


def healpix_map_from_position_error(
    skycoord: SkyCoord,
    error_radius: u.Quantity[u.deg],
    nside=hp.order2nside(HEALPIX_MAP_EVAL_ORDER),
) -> np.ndarray:
    """
    For a given sky position and error radius, create a HEALPix map of the
    probability density distribution.

    Parameters
    ----------
    skycoord
        The sky position for which to create the probability density
        distribution.
    error_radius
        The 1 sigma error radius for the sky position.
    nside
        The NSIDE value for the HEALPix map. Default is 512.

    Returns
    -------
    prob
        The probability density distribution HEALPix map.
    """
    # Create HEALPix map
    hp = ah.HEALPix(nside=nside, order="nested", frame="fk5")

    # Find RA/Dec for each pixel in HEALPix map
    hpcoord = hp.healpix_to_skycoord(np.arange(hp.npix))

    # Find angular distance of each HEALPix pixel to the skycoord
    distance = hpcoord.separation(skycoord).to(u.deg)

    # Create the probability density distribution HEALPix map
    prob = stats.norm(scale=error_radius).pdf(distance)

    # Normalize it
    prob /= np.sum(prob)

    return prob


class FOVBase:
    visible_pixels: np.ndarray

    def probability_in_fov(
        self,
        skycoord: Optional[SkyCoord] = None,
        error_radius: Optional[u.Quantity[u.deg]] = None,
        healpix_loc: Optional[FITS_rec] = None,
    ) -> float:
        """
        For a given sky position and error radius, calculate the probability of
        the sky position being inside the field of view (FOV).

        Parameters
        ----------
        skycoord
                SkyCoord object representing the position of the celestial object.
        error_radius
                The error radius for the sky position. If not given, the `skycoord`
                will be treated as a point source.
        healpix_loc
                HEALPix map of the localization.
        time
                The time of the observation.
        ephem
                Ephemeris object.

        """
        # For a point source
        if skycoord is not None and (error_radius is None or error_radius == 0.0):
            in_fov = self.in_fov(skycoord)
            return 1.0 if in_fov else 0.0
        # For a circular error region
        if skycoord is not None and error_radius is not None:
            return self.in_fov_circular_error(
                skycoord=skycoord, error_radius=error_radius
            )
        # For a HEALPix map
        elif healpix_loc is not None:
            return self.in_fov_healpix_map(healpix_loc=healpix_loc)

        # We should never get here
        raise AssertionError("No valid arguments provided")

    def in_fov(
        self,
        skycoord: SkyCoord,
    ) -> Union[bool, np.ndarray]:
        """
        Is a coordinate or set of coordinates `skycoord` inside the FOV and not
        Earth occulted.

        Note that this method only checks if the given coordinate is Earth
        occulted, so defines a simple 'all-sky' FOV with no other constraints.
        For more complex FOVs, this method should be overridden with one that
        also checks if coordinate is inside the bounds of an instrument's FOV
        for a given spacecraft attitude.

        Parameters
        ----------
        skycoord
                SkyCoord object representing the celestial object.
        time
                Time object representing the time of the observation.
        ephem
                Ephemeris object

        Returns
        -------
        bool
                True or False
        """

        # Check if skycoord pixels in list of visible pixels
        skycoord_pix = hp.ang2pix(
            hp.order2nside(HEALPIX_MAP_EVAL_ORDER),
            skycoord.ra.deg,
            skycoord.dec.deg,
            lonlat=True,
            nest=True,
        )

        in_fov = np.isin(skycoord_pix, self.visible_pixels)
        return in_fov

    def in_fov_circular_error(
        self,
        skycoord: SkyCoord,
        error_radius: u.Quantity[u.deg],
        nside: int = hp.order2nside(HEALPIX_MAP_EVAL_ORDER),
    ) -> float:
        """
        Calculate the probability of a celestial object with a circular error
        region being inside the FOV defined by the given parameters. This works
        by creating a HEALPix map of the probability density distribution, and
        then using the `in_fov_healpix_map` method to calculate the amount of
        probability inside the FOV.

        The FOV definition is based on the `in_fov` method, which checks if a
        given coordinate is inside the FOV and not Earth occulted.

        Parameters
        ----------
        skycoord
                SkyCoord object representing the celestial object.
        time
                Time object representing the time of the observation.
        ephem
                Ephemeris object
        error_radius
                The error radius for the sky position.
        nside
                The NSIDE value for the HEALPix map. Default is 512.

        Returns
        -------
        bool
                True or False
        """
        # Sanity check
        assert skycoord.isscalar, "SkyCoord must be scalar"

        # Create a HEALPix map of the probability density distribution
        prob = healpix_map_from_position_error(
            skycoord=skycoord, error_radius=error_radius, nside=nside
        )

        return self.in_fov_healpix_map(healpix_loc=prob)

    def in_fov_healpix_map(
        self,
        healpix_loc: FITS_rec,
        healpix_order: str = "NESTED",
    ) -> float:
        """
        Calculates the amount of probability inside the field of view (FOV)
        defined by the given parameters. This works by calculating a SkyCoord
        containing every non-zero probability pixel, uses the
        `in_fov` method to check which pixels are inside the FOV,
        and then finding the integrated probability of those pixels.

        Note: This method makes no attempt to deal with pixels that are only
        partially inside the FOV, i.e. Earth occultation is calculated for
        location of the center of each HEALPix pixel.

        If `healpix_order` == "NUNIQ", it assumes that `healpix_loc` contains a
        multi-order HEALPix map, and handles that accordingly.

        Parameters
        ----------
        healpix_loc
                An array containing the probability density values for each HEALPix
                pixel.
        healpix_nside
                The NSIDE value of the HEALPix map. If not provided, it will be
                calculated based on the length of healpix_loc.
        healpix_order
                The ordering scheme of the HEALPix map. Default is "NESTED".

        Returns
        -------
        float
                The amount of probability inside the FOV.

        """
        # Extract the NSIDE value from the HEALPix map, also level and ipix if
        # this is a MOC map
        if healpix_order == "NUNIQ":
            level, ipix = ah.uniq_to_level_ipix(healpix_loc["UNIQ"])
            uniq_nside = ah.level_to_nside(level)
            healpix_loc = healpix_loc["PROBDENSITY"]
        else:
            nside = ah.npix_to_nside(len(healpix_loc))

        # Find where in HEALPix map the probability is > 0
        nonzero_prob_pixels = np.where(healpix_loc > 0.0)[0]

        # Create a list of RA/Dec coordinates for these pixels
        if healpix_order == "NUNIQ":
            ra, dec = ah.healpix_to_lonlat(
                ipix[nonzero_prob_pixels],
                nside=uniq_nside[nonzero_prob_pixels],  # type: ignore
                order="NESTED",
            )
        else:
            ra, dec = ah.healpix_to_lonlat(
                nonzero_prob_pixels, nside=nside, order=healpix_order
            )

        # Convert these coordinates into a SkyCoord
        skycoord = SkyCoord(ra=ra, dec=dec, unit="deg")

        # Calculate pixel indicies of the all the regions inside of the FOV
        visible_probability_pixels = nonzero_prob_pixels[self.in_fov(skycoord=skycoord)]
        # Calculate the amount of probability inside the FOV
        if healpix_order == "NUNIQ":
            # Calculate probability in FOV by multiplying the probability density by
            # area of each pixel and summing up
            pixarea = ah.nside_to_pixel_area(uniq_nside[visible_probability_pixels])
            return np.sum(healpix_loc[visible_probability_pixels] * pixarea.value)
        else:
            # Calculate the amount of probability inside the FOV
            return np.sum(healpix_loc[visible_probability_pixels])


class FootprintFOV(FOVBase):
    """
    Constrained instrumet FOV. This is an FOV that calculate lates what is
    visible in the FOV at a given pointing
    """

    footprint: Footprint

    def __init__(self, pointing: PointingBase) -> None:
        center = SkyCoord(pointing.ra, pointing.dec, unit="deg")

        projected_footprint = self.footprint.project(
            center=center, pos_angle=pointing.position_angle * u.deg
        )

        ras_radians = projected_footprint.ra.to(u.rad).value[:-1]
        decs_radians = projected_footprint.dec.to(u.rad).value[:-1]

        cartesian_vertices = spherical_to_cartesian(
            1,  # radial component
            decs_radians,  # LAT - DECs
            ras_radians,  # LON - RAs
        )

        self.visible_pixels = hp.query_polygon(
            hp.order2nside(HEALPIX_MAP_EVAL_ORDER),
            np.array(cartesian_vertices).T,
            inclusive=True,
            nest=True,
        )


class AllSkyFOV(FOVBase):
    """
    All sky instrument FOV. This is a simple FOV that is always visible unless
    Earth occulted.
    """

    earth_constraint: EarthLimbConstraint

    def __init__(self, ephem: EphemBase, time: Time):
        """
        Finds all healpix pixels within the ephemeris time slot that are not earth
        occulted, and sets them to FOVBase.visible_pixels.

        This is done by finding the antipodal position of the earth and calculating
        all of the pixels within a disc of radius 180deg - radius_of_earth(deg)

        Antipodal:
            a_ra = ra-180 (deg)
            a_dec = -dec  (deg)
            a_radius = 180-radius (deg)

        Function does assume that it is a space mission with available ephemeris
        """
        n_side = hp.order2nside(HEALPIX_MAP_EVAL_ORDER)
        i_slice = get_slice(time=time, ephem=ephem)

        # antipodal positions
        ra = ephem.earth.ra[i_slice].degree - 180.0
        dec = -1.0 * ephem.earth.dec[i_slice].degree

        vec = hp.ang2vec(ra, dec, lonlat=True)

        # np.array to store visible pixels
        visible_pixels = np.array([]).astype(int)

        # loop over each time-slice vector and concatenate
        # visible pixels calculated with healpy's cone search (query_disc)
        # assume the earth is a disc at ephem.earth position with radius
        # radius = 180 - earthsize + constraint min angle.
        for i, v in enumerate(vec):
            radius = (
                180 * u.deg
                - ephem.earthsize[i]
                + self.earth_constraint.min_angle
            ).to_value(u.rad)
            visible_pixels = np.concatenate(
                (
                    visible_pixels,
                    hp.query_disc(n_side, v, radius, nest=True, inclusive=False),
                )
            )

        # only need unique pixels
        self.visible_pixels = np.unique(visible_pixels)
