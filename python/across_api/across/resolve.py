from typing import Optional

from fastapi import HTTPException
from astropy.coordinates.name_resolve import NameResolveError  # type: ignore
from astropy.coordinates.sky_coordinate import SkyCoord  # type: ignore

from ..base.common import ACROSSAPIBase
from ..base.schema import JobInfo
from .jobs import check_cache, register_job
from .schema import ResolveGetSchema, ResolveSchema
from antares_client.search import get_by_ztf_object_id  # type: ignore


def antares_radec(ztfname):
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
    """
    try:
        ant = get_by_ztf_object_id(ztfname)
        if ant is None:
            return None, None
    except Exception:
        return None, None
    return ant.ra, ant.dec


class Resolve(ACROSSAPIBase):
    """
    Resolve class for resolving astronomical object names.

    Parameters:
    -----------
    name : str
        The name of the astronomical object to resolve.

    Attributes:
    -----------
    status : JobInfo
        The status of the job.
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
    status: JobInfo
    # Class specific values
    ra: Optional[float]
    dec: Optional[float]
    name: str
    resolver: Optional[str]

    def __init__(self, name: str):
        self.status = JobInfo()
        # Class specific values
        self.ra = None
        self.dec = None
        self.name = name
        self.resolver = None
        if self.validate_get():
            self.get()

    @check_cache
    @register_job
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

        # Send a warning if name couldn't be resolved
        raise HTTPException(status_code=404, detail="Could not resolve name.")


ACROSSAPIResolve = Resolve
