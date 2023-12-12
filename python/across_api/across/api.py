from typing import Annotated, Optional

from fastapi import Depends, Query

from ..base.api import app
from .hello import Hello
from .resolve import Resolve
from .schema import HelloSchema, ResolveSchema


# Depends functions for FastAPI calls.
async def name(
    sourcename: Annotated[
        str, Query(description="Name of astronomical object to convert to coordinates.")
    ]
) -> str:
    return sourcename


async def your_name(
    your_name: Annotated[
        Optional[str],
        Query(
            description="Your name of person to greet.",
            title="Your Name",
        ),
    ] = None
) -> Optional[str]:
    return your_name


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


@app.get("/ACROSS/Resolve")
async def resolve(name: SourceNameDep) -> ResolveSchema:
    """
    Resolve the name of an astronomical object to its coordinates.
    """
    return Resolve(name=name).schema
