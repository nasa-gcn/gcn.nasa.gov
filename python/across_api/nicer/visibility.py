from datetime import datetime
from typing import List

import requests
import xmltodict  # type: ignore
from fastapi import HTTPException

from ..across.jobs import check_cache, register_job
from ..base.common import ACROSSAPIBase
from ..base.config import set_observatory
from ..base.schema import JobInfo, VisibilityGetSchema, VisWindow
from ..functions import convert_to_dt
from .config import NICER
from .schema import NICERVisibilitySchema, NICERVisWindow


@set_observatory(NICER)
class NICERVisibility(ACROSSAPIBase):
    """
    NICERVisibility calculator for NICER. Leverages the NICER visibility calculator
    website API in order to perform complex calculations that account for
    the structure of the ISS.

    This class is a wrapper of that API.

    Parameters
    ----------
    ra : float
        RA in decimal degrees of visibility target
    dec : float
        Declination in decimal degrees of visibility target
    begin : datetime
        Start time for visibility calculation
    end : datetime
        End time of visibility calculation
    stepsize : int
        Step size in seconds for visibility calculation (default 60).
        Note ignore for NICER, just here for compatibility.
    """

    # Schema for API class
    _schema = NICERVisibilitySchema
    _get_schema = VisibilityGetSchema

    # Type hints
    begin: datetime
    stepsize: int
    length: float
    end: datetime
    isat: bool

    # Attributes
    entries: List[VisWindow]
    status: JobInfo

    def __init__(self, begin: datetime, end: datetime, ra: float, dec: float):
        self.ra = ra
        self.dec = dec
        self.begin = begin
        self.end = end
        self.entries = list()
        self.xml = None
        self.data_dict = None
        self.username = "anonymous"
        self.stepsize = 60
        self.status: JobInfo = JobInfo()
        # Parse argument keywords
        if self.validate_get():
            # Perform Query
            self.get()

    @check_cache
    @register_job
    def get(self) -> bool:
        """
        Query NICER visibility using the online NICER NICERVisibility calculator.

        Returns
        -------
        bool
            Did it work? True | False
        """
        # Construct Query URL and parameters
        url = "https://heasarc.gsfc.nasa.gov/wsgi-scripts/nicer/visibility/nicervis.wsgi/get_vis"
        args = dict()
        args["POS"] = f"{self.ra},{self.dec}"

        # If beginning and end set, then append to URL
        if self.begin is not None and self.end is not None:
            args["T_MIN"] = self.begin  # type: ignore
            args["T_MAX"] = self.end  # type: ignore
        args["OUTPUT"] = "XML"

        # Request XML visibility VOTABLE from NICER website
        self.xml = requests.get(url, params=args)  # type: ignore
        if self.xml.status_code == 200:  # type: ignore
            try:
                self.data_dict = xmltodict.parse(self.xml.text)["VOTABLE"]["RESOURCE"][  # type: ignore
                    "TABLE"
                ][
                    "DATA"
                ][
                    "TABLEDATA"
                ][
                    "TR"
                ]
            except KeyError:
                raise HTTPException(
                    status_code=404,
                    detail="No data for this query.",
                )

            for i in range(len(self.data_dict)):  # type: ignore
                start = convert_to_dt(self.data_dict[i]["TD"][3])  # type: ignore
                stop = convert_to_dt(self.data_dict[i]["TD"][4])  # type: ignore
                initial = self.data_dict[i]["TD"][6]  # type: ignore
                final = self.data_dict[i]["TD"][7]  # type: ignore
                vw = NICERVisWindow(begin=start, end=stop, initial=initial, final=final)

                self.entries.append(vw)
            return True
        else:
            raise HTTPException(
                status_code=404,
                detail="NICER visibility tool offline.",
            )


# Mission specific names for classes
Visibility = NICERVisibility
