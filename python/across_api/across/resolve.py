# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

import json
from typing import Optional, Tuple

import httpx
from astropy.coordinates.name_resolve import NameResolveError  # type: ignore
from astropy.coordinates.sky_coordinate import SkyCoord  # type: ignore

from ..base.common import ACROSSAPIBase
from .schema import ResolveGetSchema, ResolveSchema

ANTARES_URL = "https://api.antares.noirlab.edu/v1/loci"


async def antares_radec(ztf_id: str) -> Tuple[Optional[float], Optional[float]]:
    """
    Query ANTARES API to find RA/Dec of a given ZTF source

    Parameters
    ----------
    ztf_id
        ZTF name of source

    Returns
    -------
        RA, Dec in ICRS decimal degrees, or None, None if not found

    FIXME: Replace with antares-client module call in future, once confluent-kafka-python issues are resolved.
    """
    search_query = json.dumps(
        {"query": {"bool": {"filter": {"term": {"properties.ztf_object_id": ztf_id}}}}}
    )

    params = {
        "sort": "-properties.newest_alert_observation_time",
        "elasticsearch_query[locus_listing]": search_query,
    }
    async with httpx.AsyncClient() as client:
        r = await client.get(ANTARES_URL, params=params)
    r.raise_for_status()
    antares_data = r.json()
    if antares_data["meta"]["count"] > 0:
        ra = antares_data["data"][0]["attributes"]["ra"]
        dec = antares_data["data"][0]["attributes"]["dec"]
    else:
        ra = dec = None
    return ra, dec


class Resolve(ACROSSAPIBase):
    """
    Resolve class for resolving astronomical object names.

    Parameters
    ----------
    name
        The name of the astronomical object to resolve.

    Attributes
    ----------
    ra
        The right ascension of the resolved object.
    dec
        The declination of the resolved object.
    name
        The name of the astronomical object.
    resolver
        The resolver used for resolving the object.

    Methods
    -------
    get():
        Retrieves the resolved object information.
    """

    api_name: str = "Resolve"
    _schema = ResolveSchema
    _get_schema = ResolveGetSchema

    # Type hints
    ra: Optional[float]
    dec: Optional[float]
    name: str
    resolver: Optional[str]

    def __init__(self, name: str):
        # Class specific values
        self.ra = None
        self.dec = None
        self.name = name
        self.resolver = None

    async def get(self) -> bool:
        """
        Retrieves the RA and Dec coordinates for a given name.

        Returns
        -------
            True if the name is successfully resolved, False otherwise.
        """
        # Make sure the required parameters are given in the correct format
        if not self.validate_get():
            return False

        """Do a name search"""
        # Check against the ANTARES broker
        if "ZTF" in self.name:
            ra, dec = await antares_radec(self.name)
            if ra is not None:
                self.ra, self.dec = ra, dec
                self.resolver = "ANTARES"
                return True

        # Check using the CDS resolver
        try:
            skycoord = SkyCoord.from_name(self.name)
            self.ra, self.dec = skycoord.ra.deg, skycoord.dec.deg
            self.resolver = "CDS"
            return True
        except NameResolveError:
            pass

        # If no resolution occurred, report None for resolver
        self.resolver = None
        return False
