# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

import hashlib
import json
from dataclasses import dataclass
from decimal import Decimal  # type: ignore[import]
from functools import cached_property
from typing import Optional, Union

import astropy.units as u  # type: ignore[import]
import numpy as np
from arc import tables  # type: ignore[import]
from astropy.coordinates import (  # type: ignore[import]
    Latitude,
    Longitude,
    SkyCoord,
)
from astropy.time import Time  # type: ignore[import]
from boto3.dynamodb.conditions import Key  # type: ignore[import]
from fastapi import HTTPException

from ..base.common import ACROSSAPIBase
from .constraints import burstcube_saa_constraint
from .ephem import BurstCubeEphem
from .fov import BurstCubeFOV
from .schema import (
    BurstCubeTOODelSchema,
    BurstCubeTOOGetSchema,
    BurstCubeTOOPostSchema,
    BurstCubeTOOPutSchema,
    BurstCubeTOORequestsGetSchema,
    BurstCubeTOORequestsSchema,
    BurstCubeTOOSchema,
    BurstCubeTriggerInfo,
    TOOReason,
    TOOStatus,
)


@dataclass
class BurstCubeTOO(ACROSSAPIBase):
    """
    Class to handle BurstCube Target of Opportunity Requests

    Parameters
    ----------
    sub
        sub of user making request
    id
        ID of BurstCubeTOO to fetch, by default None
    created_by
        sub of user who created the BurstCubeTOO, by default None
    created_on
        Time BurstCubeTOO was created, by default None
    modified_by
        sub of user who last modified the BurstCubeTOO, by default None
    modified_on
        Time BurstCubeTOO was last modified, by default None
    trigger_time
        Time of trigger, by default None
    trigger_info
        Information about the trigger, by default None
    exposure
        Exposure time, by default 200 * u.s
    offset
        Offset time, by default -50 * u.s
    ra
        Right Ascension, by default None
    dec
        Declination, by default None
    error_radius
        Error radius, by default None
    healpix_loc
        HEALPix location, by default None
    healpix_scheme
        HEALPix scheme, by default "nested"
    reject_reason
        Reason for rejection, by default `TOOReason.none`
    status
        Status of request, by default "Requested"
    too_info
        Information about the TOO, by default ""
    min_prob
        Minimum probability in FOV to accept a TOO request, by default 0.10
    """

    _schema = BurstCubeTOOSchema
    _get_schema = BurstCubeTOOGetSchema
    _put_schema = BurstCubeTOOPutSchema
    _del_schema = BurstCubeTOODelSchema
    _post_schema = BurstCubeTOOPostSchema

    id: Optional[str] = None
    sub: Optional[str] = None
    created_by: Optional[str] = None
    created_on: Optional[Time] = None
    modified_by: Optional[str] = None
    modified_on: Optional[Time] = None
    trigger_time: Optional[Time] = None
    trigger_info: Optional[BurstCubeTriggerInfo] = None
    exposure: u.Quantity[u.s] = 200 * u.s
    offset: u.Quantity[u.s] = -50 * u.s
    ra: Union[u.Quantity[u.deg], Longitude, None] = None
    dec: Union[u.Quantity[u.deg], Latitude, None] = None
    error_radius: Optional[u.Quantity[u.deg]] = None
    healpix_loc: Optional[np.ndarray] = None
    healpix_scheme: str = "nested"
    reject_reason: TOOReason = TOOReason.none
    status: TOOStatus = TOOStatus.requested
    too_info: str = ""
    min_prob: float = 0.10  # 10% of probability in FOV

    @property
    def table(self):
        """Return the table for the BurstCubeTOO."""
        if not hasattr(self, "_table"):
            self._table = tables.table(BurstCubeTOOSchema.__tablename__)
        return self._table

    @table.setter
    def table(self, value):
        self._table = value

    @cached_property
    def skycoord(self) -> Optional[SkyCoord]:
        """Return the skycoord of the BurstCubeTOO."""
        if self.ra is not None and self.dec is not None:
            return SkyCoord(self.ra, self.dec)
        return None

    def get(self) -> bool:
        """
        Fetch a BurstCubeTOO for a given id.

        Returns
        -------
            Did this work? True | False
        """

        # Fetch BurstCubeTOO from database
        response = self.table.get_item(Key={"id": self.id})
        if "Item" not in response:
            raise HTTPException(404, "BurstCubeTOO not found.")

        # Validate the response
        too = BurstCubeTOOSchema.model_validate(response["Item"])

        # Set the attributes of the BurstCubeTOO to the values from the database
        for k, v in too:
            setattr(self, k, v)
        return True

    def delete(self) -> bool:
        """
        Delete a given too, specified by id. created_by of BurstCubeTOO has to match yours.

        Returns
        -------
            Did this work? True | False
        """
        if self.validate_del():
            if self.get():
                # FIXME: Need proper authentication here
                if self.created_by != self.sub:
                    raise HTTPException(401, "BurstCubeTOO not owned by user.")

                self.status = TOOStatus.deleted
                self.modified_by = self.sub
                self.modified_on = Time.now().datetime.isoformat()
                # Write updated BurstCubeTOO to the database
                json_too = json.loads(
                    self.schema.model_dump_json(), parse_float=Decimal
                )
                # Add fixed partition key for the GSI
                json_too["gsipk"] = 1
                self.table.put_item(Item=json_too)
            return True
        return False

    def put(self) -> bool:
        """
        Alter existing BurstCube BurstCubeTOO using ACROSS API using POST

        Returns
        -------
            Did this work? True | False
        """
        # Make sure the PUT request validates
        if not self.validate_put():
            return False

        # Check if this BurstCubeTOO exists
        response = self.table.get_item(Key={"id": self.id})

        # Check if the TOO exists
        if "Item" not in response:
            raise HTTPException(404, "BurstCubeTOO not found.")

        # Reconstruct the TOO as it exists in the database
        old_too = BurstCubeTOO(**response["Item"])

        # FIXME: Some validation as to whether the user is allowed to update
        # this entry

        # Check if the coordinates are being changed, if yes, run the
        # check_constraints again. If a healpix file is being uploaded, run
        # the check_constraints again, as we don't record the healpix_loc for comparison.
        if (
            self.ra != old_too.ra
            or self.dec != old_too.dec
            or self.error_radius != old_too.error_radius
            or self.healpix_loc is not None
        ):
            # Check for various TOO constraints
            if not self.check_constraints():
                self.status = TOOStatus.rejected

        # Write BurstCubeTOO to the database
        self.modified_by = self.sub
        self.modified_on = Time.now().datetime.isoformat()
        json_too = json.loads(self.schema.model_dump_json(), parse_float=Decimal)
        json_too["gsipk"] = 1
        self.table.put_item(Item=json_too)

        return True

    def check_constraints(self):
        """
        Check if BurstCubeTOO parameters are valid.

        Returns
        -------
            Are BurstCubeTOO parameters valid? True | False
        """
        # Reset too_info field
        self.too_info = ""
        # Check if the trigger time is in the future
        # This is really just a sanity check, as the trigger time should be in the past
        if self.trigger_time > Time.now():
            self.too_info += "Trigger time is in the future. "
            self.reject_reason = TOOReason.other
            return False

        # Reject if trigger is > 48 hours old
        if self.trigger_time < Time.now() - 48 * u.hour:
            self.reject_reason = TOOReason.too_old
            self.too_info += "Trigger is too old. "
            return False

        # Calculate Ephemeris for the requested dump time at one second time
        # resolution
        ephem = BurstCubeEphem(
            begin=self.trigger_time + self.offset,
            end=self.trigger_time + self.offset + self.exposure,
            stepsize=1 * u.s,
        )

        # Check if the trigger time is in the SAA
        saa = burstcube_saa_constraint(time=self.trigger_time, ephem=ephem)
        if saa is True:
            self.too_info += "Trigger time inside SAA. "
            self.reject_reason = TOOReason.saa
            return False

        # Check if the trigger is inside FOV at T0
        if self.skycoord is not None or self.healpix_loc is not None:
            fov = BurstCubeFOV(ephem=ephem, time=self.trigger_time)
            infov = fov.probability_in_fov(
                skycoord=self.skycoord,
                error_radius=self.error_radius,
                healpix_loc=self.healpix_loc,
                healpix_scheme=self.healpix_scheme,
            )

            # Flag up if the required probability is not met
            if infov < self.min_prob:
                self.too_info += f"Probability inside FOV: {100*infov:.2f}%. Trigger was occulted at T0. "
                self.reject_reason = TOOReason.earth_occult
                return False
            else:
                self.too_info += f"Probability inside FOV: {100*infov:.2f}%. "

        # Check if any part of the dump time is inside the SAA, warn if so
        if True in burstcube_saa_constraint(time=ephem.timestamp, ephem=ephem):
            self.too_info += "Dump time partially inside SAA."

        #  Strip excess whitespace
        self.too_info = self.too_info.strip()
        return True

    def post(self) -> bool:
        """
        Upload BurstCubeTOO to ACROSS API using POST

        Returns
        -------
            Did this work? True | False
        """
        # Shouldn't run this unless a created_by is set
        if self.sub is None:
            raise HTTPException(401, "sub not set.")

        # Validate supplied BurstCubeTOO values against the Schema
        if not self.validate_post():
            return False

        # Set the created_on and created_by fields
        self.created_on = Time.now()
        self.created_by = self.sub

        # Set the ID of this TOO
        self.id = hashlib.md5(
            f"{self.trigger_time}{self.exposure}{self.offset}".encode()
        ).hexdigest()

        # Check if this BurstCubeTOO exists. As the id is just a hash of the
        # trigger_time, exposure and offset, then repeated requests for values
        # that match this will be caught.
        response = self.table.get_item(Key={"id": self.id})
        if response.get("Item"):
            raise HTTPException(409, "BurstCubeTOO already exists.")

        # Check for various TOO constraints
        if not self.check_constraints():
            self.status = TOOStatus.rejected

        # Write BurstCubeTOO to the database
        json_too = json.loads(self.schema.model_dump_json(), parse_float=Decimal)
        json_too["gsipk"] = 1
        self.table.put_item(Item=json_too)

        return True


class BurstCubeTOORequests(ACROSSAPIBase):
    """
    Class to fetch multiple BurstCubeTOO requests, based on various filters.

    Note that the filtering right now is based on DynamoDB scan, which is not
    very efficient. This should be replaced with a query at some point.

    Parameters
    ----------
    begin
        Start time of plan search
    end
        End time of plan search
    limit
        Limit number of searches
    duration
        Duration of time to search from now

    Attributes
    ----------
    entries
        List of BurstCubeTOO requests
    status
        Status of BurstCubeTOO query
    """

    _schema = BurstCubeTOORequestsSchema
    _get_schema = BurstCubeTOORequestsGetSchema
    mission = "ACROSS"

    def __getitem__(self, i):
        return self.entries[i]

    def __len__(self):
        return len(self.entries)

    def __init__(
        self,
        begin: Optional[Time] = None,
        end: Optional[Time] = None,
        duration: Optional[u.Quantity] = None,
        limit: Optional[int] = None,
    ):
        # Default parameters
        self.limit = limit
        self.begin = begin
        self.end = end
        self.duration = duration
        # Attributes
        self.entries: list = []

        # Parse Arguments
        if self.validate_get():
            self.get()

    def get(self) -> bool:
        """
        Get a list of BurstCubeTOO requests
        """
        # Validate query
        if not self.validate_get():
            return False
        table = tables.table(BurstCubeTOOSchema.__tablename__)

        if self.duration is not None:
            self.end = Time.now()
            self.begin = self.end - self.duration

        # Search for entries that overlap a given date range
        if self.begin is not None and self.end is not None:
            toos = table.query(
                IndexName="byCreatedOn",
                KeyConditionExpression=Key("gsipk").eq("1")
                & Key("created_on").between(self.begin.isot, self.end.isot),
            )
        elif self.limit is not None:
            # Fetch the most recent number of entries (specified by limit) in
            # reverse order of submission
            toos = table.query(
                IndexName="byCreatedOn",
                KeyConditionExpression=Key("gsipk").eq("1"),
                Limit=self.limit,
                ScanIndexForward=False,
            )
        else:
            # Fetch everything
            toos = table.scan()

        # Convert entries for return
        self.entries = [BurstCubeTOOSchema.model_validate(too) for too in toos["Items"]]

        return True


# Short aliases for classes
TOORequests = BurstCubeTOORequests
