import json
from typing import Optional, Tuple

import requests
from astropy.coordinates.name_resolve import NameResolveError  # type: ignore
from astropy.coordinates.sky_coordinate import SkyCoord  # type: ignore

from ..base.common import ACROSSAPIBase
from .schema import ResolveGetSchema, ResolveSchema

ANTARES_URL = "https://api.antares.noirlab.edu/v1/loci"


def antares_radec(ztf_id: str) -> Tuple[Optional[float], Optional[float]]:
    """
    Query ANTARES API to find RA/Dec of a given ZTF source

    Parameters
    ----------
    ztf_id : str
        ZTF name of source

    Returns
    -------
    Tuple[float, float]
        RA, Dec in ICRS decimal degrees

    FIXME: Replace with antares-client module call in future, once confluent-kafka-python issues are resolved.
    """
    search_query = json.dumps(
        {"query": {"bool": {"filter": {"term": {"properties.ztf_object_id": ztf_id}}}}}
    )

    params = {
        "sort": "-properties.newest_alert_observation_time",
        "elasticsearch_query[locus_listing]": search_query,
    }
    r = requests.get(ANTARES_URL, params=params)

    if r.status_code == 200:
        antares_data = json.loads(r.text)
        ra = antares_data["data"][0]["attributes"]["ra"]
        dec = antares_data["data"][0]["attributes"]["dec"]
        return ra, dec
    else:
        return None, None


class Resolve(ACROSSAPIBase):
    """
    Resolve class for resolving astronomical object names.

    Parameters:
    -----------
    name : str
        The name of the astronomical object to resolve.

    Attributes:
    -----------
    ra : Optional[float]
        The right ascension of the resolved object.
    dec : Optional[float]
        The declination of the resolved object.
    name : str
        The name of the astronomical object.
    resolver : Optional[str]
        The resolver used for resolving the object.

    Methods:
    --------
    get() -> bool:
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
        if self.validate_get():
            self.get()

    def get(self) -> bool:
        """
        Retrieves the RA and Dec coordinates for a given name.

        Returns
        -------
        bool
            True if the name is successfully resolved, False otherwise.

        Raises
        ------
        HTTPException
            If the name couldn't be resolved.
        """
        # Make sure the required parameters are given in the correct format
        if not self.validate_get():
            return False

        """Do a name search"""
        # Check against the ANTARES broker
        if "ZTF" in self.name:
            ra, dec = antares_radec(self.name)
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

        # If no resolution occurred, report this to the user
        self.resolver = "Could not resolve name."
        return False


ACROSSAPIResolve = Resolve
