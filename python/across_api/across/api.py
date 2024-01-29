# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from typing import Annotated, Optional

from fastapi import Depends, Query, Security

from ..base.api import app
from ..auth.api import ScopeAuthenticate
from .hello import Hello
from .resolve import Resolve
from .schema import HelloSchema, ResolveSchema


# Depends functions for FastAPI calls.
async def name(
    name: Annotated[
        str, Query(description="Name of astronomical object to convert to coordinates.")
    ]
) -> str:
    return name


async def your_name(
    name: Annotated[
        Optional[str],
        Query(
            description="Name of person to greet.",
            title="Your Name",
        ),
    ] = None
) -> Optional[str]:
    return name


SourceNameDep = Annotated[str, Depends(name)]
YourNameDep = Annotated[Optional[str], Depends(your_name)]


# API End points
@app.get("/")
async def hello(name: YourNameDep) -> HelloSchema:
    """
    This function returns a JSON response with a greeting message and an optional name parameter.
    If the name parameter is provided, the greeting message will include the name.
    """
    return Hello(name=name).schema


@app.get(
    "/secure_hello",
    dependencies=[
        Security(ScopeAuthenticate, scopes=["gcn.nasa.gov/kafka-public-consumer"])
    ],
)
async def secure_hello(name: YourNameDep) -> HelloSchema:
    """
    This function returns a JSON response with a greeting message and an optional name parameter.
    If the name parameter is provided, the greeting message will include the name.
    """
    return Hello(name=name).schema


@app.get("/across/resolve")
async def resolve(name: SourceNameDep) -> ResolveSchema:
    """
    Resolve the name of an astronomical object to its coordinates.
    """
    return Resolve(name=name).schema
