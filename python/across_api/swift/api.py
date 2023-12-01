from typing import Annotated, Literal, Optional

from fastapi import Depends, Query, status

from ..base.api import (
    DateRangeDep,
    EarthOccultDep,
    LoginDep,
    OptionalDateRangeDep,
    OptionalRaDecDep,
    OptionalRadiusDep,
    OptionalTargetIdDep,
    RaDecDep,
    StepSizeDep,
    app,
)
from ..base.schema import EphemSchema, SAASchema, VisibilitySchema
from .ephem import SwiftEphem
from .fov import SwiftFOVCheck
from .observations import SwiftObservations
from .plan import SwiftPlan
from .saa import SwiftSAA
from .schema import SwiftFOVCheckSchema, SwiftObservationsSchema, SwiftPlanSchema
from .visibility import SwiftVisibility


# Swift only Depends
def swift_instrument_query(
    instrument: Annotated[
        Literal["XRT", "UVOT", "BAT"],
        Query(
            title="Instrument",
            description="Instrument to use in FOV calculation.",
        ),
    ] = "XRT"
) -> dict:
    return {"instrument": instrument}


SwiftInstrumentDep = Annotated[
    Literal["XRT", "UVOT", "BAT"], Depends(swift_instrument_query)
]


async def optional_obsid(
    obsid: Annotated[
        Optional[str],
        Query(
            title="ObsID",
            description="ObsID to search for.",
        ),
    ] = None,
) -> Optional[str]:
    return obsid


OptionalObsIdDep = Annotated[Optional[str], Depends(optional_obsid)]


# Swift API Endpoints
@app.get("/Swift/Ephem")
async def swift_ephemeris(
    daterange: DateRangeDep,
    stepsize: StepSizeDep,
) -> EphemSchema:
    """
    Returns a Swift Ephemeris object for the given date range and step size.
    """
    return SwiftEphem(
        begin=daterange["begin"], end=daterange["end"], stepsize=stepsize
    ).schema


@app.get("/Swift/FOVCheck")
async def swift_fov_check(
    ra_dec: RaDecDep,
    daterange: DateRangeDep,
    stepsize: StepSizeDep,
    instrument: SwiftInstrumentDep,
    earthoccult: EarthOccultDep = True,
) -> SwiftFOVCheckSchema:
    """
    Endpoint for checking if a given celestial object is within the field of view of the Swift satellite.
    """
    fov = SwiftFOVCheck(
        ra=ra_dec["ra"],
        dec=ra_dec["dec"],
        begin=daterange["begin"],
        end=daterange["end"],
        stepsize=stepsize,
        earthoccult=earthoccult,
        instrument=instrument,
    )
    fov.get()
    return fov.schema


@app.get("/Swift/Observations")
async def swift_observation(
    daterange: OptionalDateRangeDep,
    ra_dec: OptionalRaDecDep,
    radius: OptionalRadiusDep,
    obsid: OptionalObsIdDep,
    targetid: OptionalTargetIdDep,
) -> SwiftObservationsSchema:
    """
    Endpoint to retrieve Swift observations based on optional filters on date range, RA/Dec, radius, obsid, and targetid.
    """
    observation = SwiftObservations(
        begin=daterange["begin"],
        end=daterange["end"],
        ra=ra_dec["ra"],
        dec=ra_dec["dec"],
        radius=radius,
        obsid=obsid,
        targetid=targetid,
    )
    observation.get()
    return observation.schema


@app.put("/Swift/Observations", status_code=status.HTTP_201_CREATED)
async def swift_observations_upload(
    user: LoginDep,
    data: SwiftObservationsSchema,
) -> SwiftObservationsSchema:
    """
    Upload Swift Observations to the server.
    """
    observations = SwiftObservations(username=user["username"], api_key=user["api_key"])
    observations.entries = data.entries
    observations.put()
    return observations.schema


@app.get("/Swift/Plan")
async def swift_plan(
    daterange: OptionalDateRangeDep,
    ra_dec: OptionalRaDecDep,
    radius: OptionalRadiusDep,
    obsid: OptionalObsIdDep,
    targetid: OptionalTargetIdDep,
) -> SwiftPlanSchema:
    """
    Endpoint for retrieving Swift observation plan.
    """
    plan = SwiftPlan(
        begin=daterange["begin"],
        end=daterange["end"],
        ra=ra_dec["ra"],
        dec=ra_dec["dec"],
        radius=radius,
        obsid=obsid,
        targetid=targetid,
    )
    plan.get()
    return plan.schema


@app.put("/Swift/Plan", status_code=status.HTTP_201_CREATED)
async def swift_plan_upload(
    user: LoginDep,
    data: SwiftPlanSchema,
) -> SwiftPlanSchema:
    """
    This function uploads a Swift plan to the server.
    """
    plan = SwiftPlan(username=user["username"], api_key=user["api_key"])
    plan.entries = data.entries
    plan.put()
    return plan.schema


@app.get("/Swift/SAA")
async def swift_saa(daterange: DateRangeDep) -> SAASchema:
    """
    Endpoint for retrieving the times of Swift SAA passages for a given date range.
    """
    return SwiftSAA(**daterange).schema


@app.get("/Swift/Visibility")
async def swift_visibility(
    daterange: DateRangeDep,
    ra_dec: RaDecDep,
) -> VisibilitySchema:
    """
    Calculates the visibility of a celestial object to the Swift satellite.
    """
    return SwiftVisibility(
        begin=daterange["begin"],
        end=daterange["end"],
        ra=ra_dec["ra"],
        dec=ra_dec["dec"],
    ).schema
