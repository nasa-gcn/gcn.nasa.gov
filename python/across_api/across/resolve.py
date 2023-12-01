import json
from typing import Optional, Tuple

import requests
from fastapi import HTTPException

from ..base.common import ACROSSAPIBase
from ..base.schema import JobInfo
from .jobs import check_cache, register_job
from .schema import ResolveGetSchema, ResolveSchema

ANTARES_URL = "https://api.antares.noirlab.edu/v1/loci"


def antares_radec(ztf_id: str) -> Tuple[Optional[float], Optional[float]]:
    """Query ANTARES API to find RA/Dec of a given ZTF source

    Parameters
    ----------
    ztf_id : str
        ZTF name of source

    Returns
    -------
    Tuple[float, float]
        RA, Dec in ICRS decimal degrees
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


def sextodeg(x: str) -> float:
    """Convert Sexagesimal string to degrees"""
    x = x.strip()
    if x[0] == "-":
        degsign = -1
    else:
        degsign = 1
    if len(x.split()) == 3:
        [h, m, s] = x.split()
        return degsign * (abs(float(h)) + (float(m) / 60) + (float(s) / 3600))
    elif len(x.split()) == 2:  # assume simbad hh mm.m format?
        [h, m] = x.split()
        return degsign * (abs(float(h)) + (float(m) / 60))
    else:
        return float(x)


# def simbad_radec(simname: str) -> Tuple[Optional[float], Optional[float]]:
#     try:
#         table = Simbad.query_object(simname)
#     except Exception:
#         return None, None
#     if table is not None:
#         sra = table[0]["RA"]  # type: ignore
#         sdec = table[0]["DEC"]  # type: ignore
#         # Apparently things can be in Simbad with no coordinates, so check this
#         if sra != "" and sdec != "":
#             ra = sextodeg(sra) * 15.0
#             dec = sextodeg(sdec)
#             return ra, dec
#     return None, None


def simbad_radec(name: str) -> Tuple[Optional[float], Optional[float]]:
    """Given a object name, return the Simbad coordinates in degrees.

    Returns:
        tuple: RA/Dec in decimal degrees (float)
    """
    url = "http://simbad.u-strasbg.fr/simbad/sim-script?script="
    script = 'format object "%IDLIST(1) | %COO(d;A D)\n' + "query id %s" % name

    lines = requests.get(url + script).text.splitlines()

    ddec = None
    dra = None
    for line in lines:
        x = line.split("|")
        try:
            name = x[0]
            numbers = x[1].split(" ")
            dra = float(numbers[1])
            ddec = float(numbers[2].strip())
        except (ValueError, IndexError):
            pass
    return dra, ddec


class Resolve(ACROSSAPIBase):
    """Generic Name resolver. Convert a source name into an RA/Dec."""

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
        # Make sure the required parameters are given in the correct format
        if not self.validate_get():
            return False

        # Perform the search
        if self.search():
            return True

        # Send a warning if name couldn't be resolved
        raise HTTPException(status_code=404, detail="Could not resolve name.")

    def search(self):
        """Do a name search"""
        # Check against the ANTARES broker
        if "ZTF" in self.name:
            ra, dec = antares_radec(self.name)
            if ra is not None:
                self.ra, self.dec = ra, dec
                self.resolver = "ANTARES"
                return True

        # Check against Simbad
        ra, dec = simbad_radec(self.name)
        if ra is not None:
            self.ra, self.dec = ra, dec
            self.resolver = "Simbad"
            return True

        return False


ACROSSAPIResolve = Resolve
