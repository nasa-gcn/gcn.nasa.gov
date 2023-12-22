# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from datetime import datetime, timezone
from typing import Annotated, Optional

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


# Helper functions
def to_naive_utc(value: datetime) -> datetime:
    """
    Converts a datetime object to a naive datetime object in UTC timezone.

    Arguments
    ---------
    value
        The datetime object to be converted.

    Returns
    -------
        The converted naive datetime object in UTC timezone.
    """
    return value.astimezone(tz=timezone.utc).replace(tzinfo=None)


# Globally defined Depends definitions
async def epoch(
    epoch: Annotated[
        datetime,
        Query(
            title="Epoch",
            description="Epoch in UTC or ISO format.",
        ),
    ],
) -> Optional[datetime]:
    return to_naive_utc(epoch)


EpochDep = Annotated[datetime, Depends(epoch)]
