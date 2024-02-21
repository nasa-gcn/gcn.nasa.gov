# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

import gzip
from typing import Annotated, BinaryIO, Tuple, Union

from astropy.io import fits  # type: ignore
from fastapi import Depends, File, HTTPException, Security, UploadFile, status

from ..auth.api import claims, scope_authorize
from ..base.depends import (
    ErrorRadiusDep,
    ExposureDep,
    IdDep,
    LimitDep,
    OffsetDep,
    OptionalDateRangeDep,
    OptionalDurationDep,
    OptionalRaDecDep,
    TriggerTimeDep,
)
from ..base.api import app
from .schema import BurstCubeTOORequestsSchema, BurstCubeTOOSchema, BurstCubeTriggerInfo
from .toorequest import BurstCubeTOO, BurstCubeTOORequests


def read_healpix_file(healpix_file: UploadFile) -> Tuple[fits.FITS_rec, str]:
    """Read in a HEALPix file in FITS format and return the HDUList. Supports
    gzipped FITS files"""

    # Type hint for the file object
    file: Union[gzip.GzipFile, BinaryIO]

    # If the file is a gzip file, open it with gzip.open, otherwise just
    # pass along the filehandle
    # FIXME: Remove compression handling if this issue is resolved:
    # https://github.com/astropy/astropy/issues/16171
    if healpix_file.content_type == "application/x-gzip":
        file = gzip.open(healpix_file.file, "rb")
    else:
        file = healpix_file.file

    # Open HEALPix fits file and extract data and ordering scheme
    try:
        with fits.open(file) as hdu:
            healpix_data = hdu[1].data
            healpix_scheme = hdu[1].header["ORDERING"]
    except (OSError, KeyError, IndexError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid HEALPix file.",
        )
    return healpix_data, healpix_scheme


@app.post(
    "/burstcube/too",
    status_code=status.HTTP_201_CREATED,
    dependencies=[
        Security(scope_authorize, scopes=["gcn.nasa.gov/burstcube-too-submitter"])
    ],
)
async def burstcube_too_submit(
    credential: Annotated[dict, Depends(claims)],
    ra_dec: OptionalRaDecDep,
    error_radius: ErrorRadiusDep,
    trigger_time: TriggerTimeDep,
    trigger_info: BurstCubeTriggerInfo,
    exposure: ExposureDep,
    offset: OffsetDep,
    healpix_file: UploadFile = File(
        None, description="HEALPix file describing the localization."
    ),
) -> BurstCubeTOOSchema:
    """
    Resolve the name of an astronomical object to its coordinates.
    """
    # Construct the TOO object.
    too = BurstCubeTOO(
        sub=credential["sub"],
        ra=ra_dec["ra"],
        dec=ra_dec["dec"],
        error_radius=error_radius,
        trigger_time=trigger_time,
        trigger_info=trigger_info,
        exposure=exposure,
        offset=offset,
    )
    # If a HEALpix file was uploaded, open it and set the healpix_loc
    # and healpix_scheme attributes.
    if healpix_file is not None:
        too.healpix_loc, too.healpix_scheme = read_healpix_file(healpix_file)
    too.post()
    return too.schema


@app.put(
    "/burstcube/too/{id}",
    status_code=status.HTTP_201_CREATED,
    dependencies=[
        Security(scope_authorize, scopes=["gcn.nasa.gov/burstcube-too-submitter"])
    ],
)
async def burstcube_too_update(
    id: IdDep,
    credential: Annotated[dict, Depends(claims)],
    ra_dec: OptionalRaDecDep,
    error_radius: ErrorRadiusDep,
    trigger_time: TriggerTimeDep,
    trigger_info: BurstCubeTriggerInfo,
    exposure: ExposureDep,
    offset: OffsetDep,
    healpix_file: UploadFile = File(
        None, description="HEALPix file describing the localization."
    ),
) -> BurstCubeTOOSchema:
    """
    Update a BurstCube TOO object with the given ID number.
    """
    # Update the TOO object.
    too = BurstCubeTOO(
        id=id,
        sub=credential["sub"],
        ra=ra_dec["ra"],
        dec=ra_dec["dec"],
        error_radius=error_radius,
        trigger_time=trigger_time,
        trigger_info=trigger_info,
        exposure=exposure,
        offset=offset,
    )
    # If a HEALpix file was uploaded, open it and set the healpix_loc
    # and healpix_scheme attributes.
    if healpix_file is not None:
        too.healpix_loc, too.healpix_scheme = read_healpix_file(healpix_file)
    too.put()
    return too.schema


@app.get("/burstcube/too/", status_code=status.HTTP_200_OK)
async def burstcube_too_requests(
    daterange: OptionalDateRangeDep,
    duration: OptionalDurationDep,
    limit: LimitDep,
) -> BurstCubeTOORequestsSchema:
    """
    Endpoint to retrieve BurstCube multiple TOO requests.
    """
    return BurstCubeTOORequests(
        begin=daterange["begin"],
        end=daterange["end"],
        duration=duration,
        limit=limit,
    ).schema


@app.get("/burstcube/too/{id}", status_code=status.HTTP_200_OK)
async def burstcube_too(
    id: IdDep,
) -> BurstCubeTOOSchema:
    """
    Retrieve a BurstCube Target of Opportunity (TOO) by ID.
    """
    too = BurstCubeTOO(id=id)
    too.get()
    return too.schema


@app.delete(
    "/burstcube/too/{id}",
    status_code=status.HTTP_200_OK,
    dependencies=[
        Security(scope_authorize, scopes=["gcn.nasa.gov/burstcube-too-submitter"])
    ],
)
async def burstcube_delete_too(
    credential: Annotated[dict, Depends(claims)],
    id: IdDep,
) -> BurstCubeTOOSchema:
    """
    Delete a BurstCube Target of Opportunity (TOO) with the given ID.
    """
    too = BurstCubeTOO(sub=credential["sub"], id=id)
    too.delete()
    return too.schema
