from fastapi import status

from ..base.api import (
    DateRangeDep,
    LoginDep,
    OptionalDateRangeDep,
    OptionalObsIdDep,
    OptionalRaDecDep,
    OptionalRadiusDep,
    OptionalTargetIdDep,
    RaDecDep,
    app,
)
from .plan import NICERPlan
from .schema import NICERPlanSchema, NICERVisibilitySchema
from .visibility import NICERVisibility


@app.get("/NICER/Plan")
async def nicer_plan(
    daterange: OptionalDateRangeDep,
    ra_dec: OptionalRaDecDep,
    radius: OptionalRadiusDep,
    obsid: OptionalObsIdDep,
    targetid: OptionalTargetIdDep,
) -> NICERPlanSchema:
    """
    Returns a NICER observation plan based on the given parameters.
    """
    plan = NICERPlan(
        begin=daterange["begin"],
        end=daterange["end"],
        obsid=obsid,
        targetid=targetid,
        ra=ra_dec["ra"],
        dec=ra_dec["dec"],
        radius=radius,
    )
    plan.get()
    return plan.schema


@app.put("/NICER/Plan", status_code=status.HTTP_201_CREATED)
async def nicer_plan_upload(
    user: LoginDep,
    data: NICERPlanSchema,
) -> NICERPlanSchema:
    """
    Uploads a NICER Plan.
    """
    plan = NICERPlan(username=user["username"], api_key=user["api_key"])
    plan.entries = data.entries
    plan.put()
    return plan.schema


@app.get("/NICER/Visibility")
async def nicer_visibility(
    daterange: DateRangeDep,
    ra_dec: RaDecDep,
) -> NICERVisibilitySchema:
    """
    Returns the visibility of an astronomical object to NICER for a given date range and RA/Dec coordinates.
    """
    return NICERVisibility(
        begin=daterange["begin"],
        end=daterange["end"],
        ra=ra_dec["ra"],
        dec=ra_dec["dec"],
    ).schema
