# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from datetime import datetime
from typing import Annotated, Optional

import astropy.units as u  # type: ignore
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


# Globally defined Depends definitions
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


# Depends functions for FastAPI calls.
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


def stepsize(
    stepsize: Annotated[
        int,
        Query(
            ge=1,
            title="Step Size",
            description="Time resolution in which to calculate result in seconds.",
        ),
    ] = 60,
) -> int:
    return stepsize * u.s


StepSizeDep = Annotated[int, Depends(stepsize)]
