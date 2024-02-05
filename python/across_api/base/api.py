# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

"""
Base API definitions for ACROSS API. This module is imported by all other API
modules. Contains the FastAPI app definition and globally defined Depends.
"""

from datetime import datetime
from typing import Annotated, Optional

from astropy.time import Time  # type: ignore
from fastapi import Depends, FastAPI, Query

# FastAPI app definition
app = FastAPI(
    title="ACROSS API",
    summary="Astrophysics Cross-Observatory Science Support (ACROSS).",
    description="API providing information on various NASA missions to aid in coordination of large observation efforts.",
    contact={
        "email": "support@gcn.nasa.gov",
    },
    root_path="/labs/api/v1",
)


def epoch(
    epoch: Annotated[
        datetime,
        Query(
            title="Epoch",
            description="Epoch in UTC or ISO format.",
        ),
    ],
) -> Optional[Time]:
    return Time(epoch)


EpochDep = Annotated[datetime, Depends(epoch)]


def daterange(
    begin: Annotated[
        datetime,
        Query(description="Start time of period to be calculated.", title="Begin"),
    ],
    end: Annotated[
        datetime, Query(description="End time of period to be calculated.", title="End")
    ],
) -> dict:
    """
    Helper function to convert begin and end to datetime objects.
    """
    return {"begin": Time(begin), "end": Time(end)}


DateRangeDep = Annotated[dict, Depends(daterange)]
