from typing import Annotated, Optional

from fastapi import Query

from ..base.api import app
from .hello import Hello
from .resolve import Resolve
from .schema import HelloSchema, ResolveSchema


# API End points
@app.get("/")
async def hello(
    name: Annotated[
        Optional[str], Query(description="Your name, if you wish to give it.")
    ] = None
) -> HelloSchema:
    """
    This function returns a JSON response with a greeting message and an optional name parameter.
    If the name parameter is provided, the greeting message will include the name.
    """
    return Hello(name=name).schema


@app.get("/ACROSS/Resolve")
async def resolve(
    name: Annotated[
        str, Query(description="Name of astronomical object to convert to coordinates.")
    ]
) -> ResolveSchema:
    """
    Resolve the name of an astronomical object to its coordinates.
    """
    return Resolve(name=name).schema
