from datetime import datetime
from io import BytesIO
from typing import Annotated, Optional

from astropy.io import fits  # type: ignore
from fastapi import Depends, File, Query, status

from ..base.api import (
    ClassificationDep,
    DateRangeDep,
    EarthOccultDep,
    ErrorRadiusDep,
    ExposureDep,
    IdDep,
    JustificationDep,
    LimitDep,
    LoginDep,
    OffsetDep,
    OptionalDateRangeDep,
    OptionalRaDecDep,
    RaDecDep,
    StepSizeDep,
    TriggerIdDep,
    TriggerInstrumentDep,
    TriggerMissionDep,
    TriggerTimeDep,
    app,
)
from ..base.schema import EphemSchema, SAASchema
from ..functions import convert_to_dt
from .ephem import BurstCubeEphem
from .fov import BurstCubeFOVCheck
from .saa import BurstCubeSAA
from .schema import (
    BurstCubeFOVCheckSchema,
    BurstCubeTOORequestsSchema,
    BurstCubeTOOSchema,
)
from .toorequest import BurstCubeTOO, BurstCubeTOOPutSchema, BurstCubeTOORequests
from .visibility import BurstCubeVisibility, BurstCubeVisibilitySchema


# BurstCube Deps
async def optional_trigger_time(
    trigger_time: Annotated[
        Optional[datetime],
        Query(
            title="Trigger Time",
            description="Time of trigger in UTC or ISO format.",
        ),
    ] = None,
) -> Optional[datetime]:
    return convert_to_dt(trigger_time)


OptionalTriggerTimeDep = Annotated[datetime, Depends(optional_trigger_time)]


async def optional_trigger_instrument(
    trigger_instrument: Annotated[
        Optional[str],
        Query(
            title="Trigger Instrument",
            description="Instrument that triggered the TOO.",
        ),
    ] = None,
) -> Optional[str]:
    return trigger_instrument


OptionalTriggerInstrumentDep = Annotated[str, Depends(optional_trigger_instrument)]


async def optional_trigger_mission(
    trigger_mission: Annotated[
        Optional[str],
        Query(
            title="Trigger Mission",
            description="Mission that triggered the TOO.",
        ),
    ] = None,
) -> Optional[str]:
    return trigger_mission


OptionalTriggerMissionDep = Annotated[str, Depends(optional_trigger_mission)]


async def optional_trigger_id(
    trigger_id: Annotated[
        Optional[str],
        Query(
            title="Trigger ID",
            description="ID of the trigger.",
        ),
    ] = None,
) -> Optional[str]:
    return trigger_id


OptionalTriggerIdDep = Annotated[str, Depends(optional_trigger_id)]


# BurstCube endpoints
@app.get("/BurstCube/Ephem")
async def burstcube_ephemeris(
    daterange: DateRangeDep,
    stepsize: StepSizeDep,
) -> EphemSchema:
    """
    Calculates the ephemeris for BurstCube.
    """
    return BurstCubeEphem(
        begin=daterange["begin"], end=daterange["end"], stepsize=stepsize
    ).schema


@app.get("/BurstCube/FOVCheck")
async def burstcube_fov_check(
    ra_dec: RaDecDep,
    daterange: DateRangeDep,
    stepsize: StepSizeDep,
    earth_occult: EarthOccultDep = True,
) -> BurstCubeFOVCheckSchema:
    """
    This endpoint checks if a given point in the sky is within the field of view of the BurstCube telescope, for a given time.
    """
    fov = BurstCubeFOVCheck(
        ra=ra_dec["ra"],
        dec=ra_dec["dec"],
        begin=daterange["begin"],
        end=daterange["end"],
        stepsize=stepsize,
        earthoccult=earth_occult,
    )
    fov.get()
    return fov.schema


# Start of BurstCube API Endpoints


@app.get("/BurstCube/SAA")
async def burstcube_saa(
    daterange: DateRangeDep,
    stepsize: StepSizeDep,
) -> SAASchema:
    """
    Endpoint to retrieve BurstCubeSAA data for a given date range and step size.
    """
    return BurstCubeSAA(stepsize=stepsize, **daterange).schema


@app.post("/BurstCube/TOO", status_code=status.HTTP_201_CREATED)
async def burstcube_too_submit(
    user: LoginDep,
    ra_dec: OptionalRaDecDep,
    error: ErrorRadiusDep,
    trigger_time: TriggerTimeDep,
    trigger_mission: TriggerMissionDep,
    trigger_instrument: TriggerInstrumentDep,
    trigger_id: TriggerIdDep,
    classification: ClassificationDep,
    justification: JustificationDep,
    date_range: OptionalDateRangeDep,
    exposure: ExposureDep,
    offset: OffsetDep,
    healpix_file: Annotated[
        bytes, File(description="HEALPix file describing the localization.")
    ] = b"",
) -> BurstCubeTOOSchema:
    """
    Submits a BurstCube Target of Opportunity (TOO) request.
    """
    # Construct the TOO object.
    too = BurstCubeTOO(
        username=user["username"],
        api_key=user["api_key"],
        ra=ra_dec["ra"],
        dec=ra_dec["dec"],
        error_radius=error,
        trigger_time=trigger_time,
        trigger_mission=trigger_mission,
        trigger_instrument=trigger_instrument,
        trigger_id=trigger_id,
        classification=classification,
        justification=justification,
        begin=date_range["begin"],
        end=date_range["end"],
        exposure=exposure,
        offset=offset,
    )
    # If a HEALpix file was uploaded, open it and set the healpix_loc
    # and healpix_order attributes.
    if healpix_file != b"":
        hdu = fits.open(BytesIO(healpix_file))
        too.healpix_loc = hdu[1].data
        too.healpix_order = hdu[1].header["ORDERING"]
    too.post()
    return too.schema


@app.put("/BurstCube/TOO/{id}", status_code=status.HTTP_201_CREATED)
async def burstcube_too_update(
    user: LoginDep,
    id: IdDep,
    data: BurstCubeTOOPutSchema,
) -> BurstCubeTOOSchema:
    """
    Update a BurstCube TOO object with the given ID number.

    Parameters
    ----------

    user : LoginDep
        The user object containing the API key.
    id : IdDep
        The ID number of the BurstCube TOO object to update.
    data : BurstCubeTOOPutSchema
        The updated data for the BurstCube TOO object.

    Returns
    -------
    BurstCubeTOOSchema
        The updated BurstCube TOO object.

    """
    too = BurstCubeTOO(api_key=user["api_key"], **data.model_dump())
    too.post()
    return too.schema


@app.get("/BurstCube/TOO/{id}", status_code=status.HTTP_200_OK)
async def burstcube_too(
    user: LoginDep,
    id: IdDep,
) -> BurstCubeTOOSchema:
    """
    Retrieve a BurstCube Target of Opportunity (TOO) by ID.
    """
    too = BurstCubeTOO(username=user["username"], api_key=user["api_key"], id=id)
    too.get()
    return too.schema


@app.delete("/BurstCube/TOO/{id}", status_code=status.HTTP_200_OK)
async def burstcube_delete_too(
    user: LoginDep,
    id: IdDep,
) -> BurstCubeTOOSchema:
    """
    Delete a BurstCube Target of Opportunity (TOO) with the given ID.
    """
    too = BurstCubeTOO(username=user["username"], api_key=user["api_key"], id=id)
    too.delete()
    return too.schema


@app.get("/BurstCube/TOORequests")
async def burstcube_too_requests(
    user: LoginDep,
    daterange: OptionalDateRangeDep,
    ra_dec: OptionalRaDecDep,
    trigger_time: OptionalTriggerTimeDep,
    trigger_instrument: OptionalTriggerInstrumentDep,
    trigger_mission: OptionalTriggerMissionDep,
    trigger_id: OptionalTriggerIdDep,
    limit: LimitDep = None,
) -> BurstCubeTOORequestsSchema:
    """
    Endpoint to retrieve BurstCube TOO requests.
    """
    return BurstCubeTOORequests(
        username=user["username"],
        api_key=user["api_key"],
        begin=daterange["begin"],
        end=daterange["end"],
        ra=ra_dec["ra"],
        dec=ra_dec["dec"],
        trigger_time=trigger_time,
        trigger_instrument=trigger_instrument,
        trigger_mission=trigger_mission,
        trigger_id=trigger_id,
        limit=limit,
    ).schema


@app.get("/BurstCube/Visibility")
async def burstcube_visibility(
    daterange: DateRangeDep,
    ra_dec: RaDecDep,
) -> BurstCubeVisibilitySchema:
    """
    Returns the visibility of an astronomical object to BurstCube for a given date range and RA/Dec coordinates.
    """
    return BurstCubeVisibility(
        begin=daterange["begin"],
        end=daterange["end"],
        ra=ra_dec["ra"],
        dec=ra_dec["dec"],
    ).schema
