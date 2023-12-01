from datetime import datetime, timedelta
from typing import Optional

import astropy.units as u  # type: ignore
import numpy as np  # type: ignore
from fastapi import HTTPException
from sqlalchemy import between, select
from sqlalchemy.orm import Session

from ..across.jobs import register_job
from ..across.user import check_api_key
from ..api_db import engine, sa_angular_distance
from ..base.common import ACROSSAPIBase
from ..base.config import set_observatory
from ..base.schema import JobInfo
from ..burstcube.fov import BurstCubeFOVCheck
from ..functions import round_time
from .config import BURSTCUBE
from .models import BurstCubeTOOModel
from .saa import SAA
from .schema import (
    BurstCubePoint,
    BurstCubeTOODelSchema,
    BurstCubeTOOGetSchema,
    BurstCubeTOOModelSchema,
    BurstCubeTOOPostSchema,
    BurstCubeTOOPutSchema,
    BurstCubeTOORequestsGetSchema,
    BurstCubeTOORequestsSchema,
    BurstCubeTOOSchema,
    TOOReason,
    TOOStatus,
)


@set_observatory(BURSTCUBE)
class BurstCubeTOO(ACROSSAPIBase):
    """
    Class to handle BurstCube Target of Opportunity Requests

    Parameters
    ----------
    username : str
        Username of user making request
    api_key : str
        API key of user making request
    id : Optional[int], optional
        ID of BurstCubeTOO to fetch, by default None
    """

    _schema = BurstCubeTOOSchema
    _get_schema = BurstCubeTOOGetSchema
    _put_schema = BurstCubeTOOPutSchema
    _del_schema = BurstCubeTOODelSchema
    _post_schema = BurstCubeTOOPostSchema

    id: Optional[int]
    username: str
    timestamp: Optional[datetime]
    ra: Optional[float]
    dec: Optional[float]
    error: Optional[float]
    trigger_time: datetime
    trigger_mission: str
    trigger_instrument: str
    trigger_id: str
    trigger_duration: Optional[float]
    classification: Optional[str]
    justification: Optional[str]
    begin: Optional[datetime]
    end: Optional[datetime]
    exposure: float
    offset: float
    reason: TOOReason
    healpix_loc: Optional[np.ndarray]
    healpix_order: str = "nested"
    healpix_minprob: float = 0.01  # 1% of probability in FOV
    too_status: TOOStatus
    too_info: str

    def __init__(self, username: str, api_key: str, id: Optional[int] = None, **kwargs):
        # Set Optional Parameters to None
        self.begin = None
        self.end = None
        self.ra = None
        self.dec = None
        self.healpix_loc = None
        self.healpix_order = "nested"
        self.id = None
        self.timestamp = None
        self.too_info = ""

        # Parameter defaults
        self.exposure = 200  # default exposure time (e.g. length of dump)
        # default offset. Moves the triggertime 50s before the middle of the dump window.
        self.offset = -50
        # Status of job
        self.status: JobInfo = JobInfo()
        # Parse Arguments
        self.username = username
        self.api_key = api_key
        self.id = id
        # Parse other keyword arguments
        for k, v in kwargs.items():
            if k in self._schema.model_fields.keys():
                setattr(self, k, v)

    @check_api_key(anon=False)
    @register_job
    def get(self) -> bool:
        """
        Fetch a BurstCubeTOO for a given id.

        Returns
        -------
        bool
            Did this work? True | False
        """
        if self.validate_get():
            with Session(engine) as sess:
                too = (
                    sess.query(BurstCubeTOOModel)
                    .where(BurstCubeTOOModel.id == self.id)
                    .scalar()
                )
                if too is not None:
                    # Load the BurstCubeTOO parameters into this class
                    for k, v in BurstCubeTOOModelSchema.model_validate(too):
                        setattr(self, k, v)
                    return True
                else:
                    raise HTTPException(404, "BurstCubeTOO not found.")

        return False

    @check_api_key(anon=False)
    @register_job
    def delete(self) -> bool:
        """
        Delete a given too, specified by id. username of BurstCubeTOO has to match yours.

        Returns
        -------
        bool
            Did this work? True | False
        """
        if self.validate_del():
            with Session(engine) as sess:
                too = (
                    sess.query(BurstCubeTOOModel)
                    .where(BurstCubeTOOModel.id == self.id)
                    .scalar()
                )
                if too is None:
                    raise HTTPException(404, "BurstCubeTOO not found.")
                elif too.username != self.username:
                    raise HTTPException(401, "BurstCubeTOO not owned by user.")
                else:
                    sess.delete(too)
                    sess.commit()
            return True
        return False

    def check_for_previous_toos(self) -> bool:
        """
        Check if previous BurstCubeTOOs match the one to be submited.

        Returns
        -------
        bool
            Does a previous BurstCubeTOO match this one? True | False
        """
        with Session(engine, expire_on_commit=False) as sess:
            # Fetch previous BurstCubeTOOs
            previous = (
                sess.query(BurstCubeTOOModel)
                .filter_by(trigger_mission=self.trigger_mission)
                .filter(
                    BurstCubeTOOModel.trigger_time.between(
                        self.trigger_time - timedelta(seconds=1),
                        self.trigger_time + timedelta(seconds=1),
                    )
                )
            ).all()

            found = len(previous)
            if found == 0:
                # If there's none, we're good
                return False
            else:
                deleted = 0
                for too in previous:
                    # If this BurstCubeTOO gives RA/Dec and the previous didn't then we
                    # should override the previous one
                    if too.ra is None and self.ra is not None:
                        print(f"deleting old BurstCubeTOO {too.id} as RA now given")
                        sess.delete(too)
                        deleted += 1
                        continue

                    # Check if burst time is more accurate
                    if (
                        too.trigger_time.microsecond == 0
                        and self.trigger_time.microsecond != 0
                    ):
                        print(
                            f"deleting old BurstCubeTOO {too.id} as triggertime more accurate."
                        )
                        sess.delete(too)
                        deleted += 1
                        continue

                    # Check if more exposure time requested
                    if too.exposure > self.exposure:
                        print(
                            f"deleting old BurstCubeTOO {too.id} as triggertime as more exposure time requested."
                        )
                        sess.delete(too)
                        deleted += 1
                        continue
                sess.commit()
            if deleted == found:
                return False

        return True

    @check_api_key(anon=False)
    @register_job
    def put(self) -> bool:
        """
        Alter existing BurstCube BurstCubeTOO using ACROSS API using POST

        Returns
        -------
        bool
            Did this work? True | False
        """
        # Insert this BurstCubeTOO
        if self.id is None:
            return self.post()

        # If id is given, assume we're modifying an existing BurstCubeTOO.
        # Check if this BurstCubeTOO exists and is of the same username
        with Session(engine) as sess:
            stmt = (
                select(BurstCubeTOOModel)
                .where(BurstCubeTOOModel.id == self.id)
                .where(BurstCubeTOOModel.username == self.username)
            )
            too = sess.scalar(stmt)
            if too is None:
                raise HTTPException(404, "BurstCubeTOO not found.")

            # Update the BurstCubeTOO Model with the set parameters
            for k, v in (
                BurstCubeTOOModelSchema.model_validate(self).model_dump().items()
            ):
                if v is not None:
                    setattr(too, k, v)

            # Update in database
            sess.merge(too)
            sess.commit()

        return True

    def check_constraints(self):
        """
        Check if BurstCubeTOO parameters are valid.

        Returns
        -------
        bool
            Are BurstCubeTOO parameters valid? True | False
        """
        # Check if the trigger time is in the future
        if self.trigger_time > datetime.utcnow():
            self.status.warning("Trigger time is in the future.")
            self.reason = TOOReason.other
            self.too_status = TOOStatus.rejected
            return False

        # Reject if trigger is > 48 hours old
        if self.trigger_time < datetime.utcnow() - timedelta(hours=48):
            self.reason = TOOReason.too_old
            self.status.warning("Trigger is too old.")
            self.too_status = TOOStatus.rejected
            return False

        # Check if the trigger time is in the SAA
        saa = SAA(begin=self.trigger_time, end=self.trigger_time, stepsize=1)
        if saa.insaa(self.trigger_time):
            self.status.warning("Trigger time inside SAA.")
            self.reason = TOOReason.saa
            self.too_status = TOOStatus.rejected
            return False
        print(f"{self.ra=} {self.dec=} {self.healpix_loc=}")
        # Check if the trigger time is inside FOV
        if (
            self.ra is not None and self.dec is not None
        ) or self.healpix_loc is not None:
            fov = BurstCubeFOVCheck(
                begin=self.trigger_time,
                end=self.trigger_time,
                ra=self.ra,
                dec=self.dec,
                healpix_loc=self.healpix_loc,
                healpix_order=self.healpix_order,
                stepsize=1,
            )
            if fov.get() is True:
                # Check to see if trigger was in instrument FOV
                # (for BurstCube this means, anywhere but Earth Occulted)
                infov = fov.infov(self.trigger_time)
                if infov is False:
                    self.status.warning("Trigger was occulted at T0.")
                    self.reason = TOOReason.earth_occult
                    self.too_status = TOOStatus.rejected
                    return False
                # If a BurstCubePoint is returned by infov, check if IFOV coverage is None or < 1%, report occulted
                # FIXME: Rather than hardcoding, this should be a parameter in config.py
                elif type(infov) is BurstCubePoint and (
                    infov.infov is None or infov.infov < self.healpix_minprob
                ):
                    self.status.warning("Trigger was occulted at T0.")
                    self.reason = TOOReason.earth_occult
                    self.too_status = TOOStatus.rejected
                    return False
                else:
                    self.status.warning(
                        f"Probability inside FOV: {100*infov.infov:.2f}%."
                    )

        # Check if any part of the dump time is inside the SAA, warn if so
        if sum(saa.insaacons) > 0:
            self.status.warning("Dump time partially inside SAA.")

        # Return true
        return True

    @check_api_key(anon=False)
    @register_job
    def post(self) -> bool:
        """
        Upload BurstCubeTOO to ACROSS API using POST

        Returns
        -------
        bool
            Did this work? True | False
        """
        # Validate supplied BurstCubeTOO values against the Schema
        if not self.validate_post():
            return False

        # Set the start and end time of the BurstCube event dump
        if self.begin is None or self.end is None:
            # If self.offset = 0, triggertime will be at the center of the dump window
            # FIXME - why is it necessary to convert offset into a int from a string?
            self.offset = int(self.offset)
            self.begin = round_time(self.trigger_time, 1) - timedelta(
                seconds=self.exposure + self.offset
            )
            self.end = self.begin + timedelta(seconds=self.exposure)

        # Check if this matches a previous BurstCubeTOO
        if self.check_for_previous_toos():
            raise HTTPException(200, "TOO already submitted")

        # Check for various TOO constraints
        if not self.check_constraints():
            self.status.warning(
                "TOO request was recorded, but rejected due to a constraint."
            )

        # Compile all warnings and put them into too_info
        self.too_info = self.too_info + " ".join(self.status.warnings)

        # Write BurstCubeTOO to the database
        too = BurstCubeTOOModel(
            **BurstCubeTOOModelSchema.model_validate(self).model_dump()
        )
        with Session(engine) as sess:
            sess.add(too)
            sess.commit()
            self.id = too.id
            self.timestamp = too.timestamp

        return True


class BurstCubeTOORequests(ACROSSAPIBase):
    """
    Class to handle multiple BurstCubeTOO requests

    Parameters
    ----------
    username : str
        Username for API
    api_key : str
        API Key for user
    begin : Optional[datetime]
        Start time of plan search
    end : Optional[datetime]
        End time of plan search
    limit : Optional[int]
        Limit number of searches
    trigger_time : Optional[datetime]
        Time of trigger
    ra : Optional[float]
        Right ascension of trigger search
    dec : Optional[float]
        Declination of trigger search
    radius : Optional[float]
        Radius of search around for trigger

    Attributes
    ----------
    entries : list
        List of BurstCubeTOO requests
    status : JobInfo
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
        username: str,
        api_key: str,
        begin: Optional[datetime] = None,
        end: Optional[datetime] = None,
        limit: Optional[int] = None,
        trigger_time: Optional[datetime] = None,
        trigger_mission: Optional[str] = None,
        trigger_instrument: Optional[str] = None,
        trigger_id: Optional[str] = None,
        ra: Optional[float] = None,
        dec: Optional[float] = None,
        radius: Optional[float] = None,
    ):
        # Default parameters
        self.username = username
        self.api_key = api_key
        self.trigger_time = trigger_time
        self.trigger_instrument = trigger_instrument
        self.trigger_mission = trigger_mission
        self.trigger_id = trigger_id
        self.limit = limit
        self.begin = begin
        self.end = end
        self.ra = ra
        self.dec = dec
        self.radius = radius
        # Attributes
        self.entries: list = []
        self.status: JobInfo = JobInfo()
        # Parse Arguments
        if self.validate_get():
            self.get()

    @check_api_key(anon=False)
    @register_job
    def get(self) -> bool:
        """
        Get a list of BurstCubeTOO requests

        Returns
        -------
        bool
            Did this work? True | False
        """
        # Validate query
        if not self.validate_get():
            return False

        stmt = select(BurstCubeTOOModel)

        # Search for events that cover a given trigger_time
        if self.trigger_time is not None:
            stmt = stmt.where(
                between(
                    self.trigger_time, BurstCubeTOOModel.begin, BurstCubeTOOModel.end
                )
            )

        # Search for events that overlap a given date range
        if self.begin is not None and self.end is not None:
            stmt = stmt.where(BurstCubeTOOModel.end > self.begin).where(
                BurstCubeTOOModel.begin < self.end
            )

        # Set the order that requests are returned
        stmt = stmt.order_by(BurstCubeTOOModel.trigger_time.desc())

        # Set a limit on the number of searches
        if self.limit is not None:
            stmt = stmt.limit(self.limit)

        # Select on trigger_mission if given
        if self.trigger_mission is not None:
            stmt = stmt.where(BurstCubeTOOModel.trigger_mission == self.trigger_mission)

        # Select on trigger_instrument if given
        if self.trigger_instrument is not None:
            stmt = stmt.where(
                BurstCubeTOOModel.trigger_instrument == self.trigger_instrument
            )

        # Select on trigger_id if given
        if self.trigger_id is not None:
            stmt = stmt.where(BurstCubeTOOModel.trigger_id == self.trigger_id)

        # Check if a radius has been set, if not use default
        # FIXME: Set to specific instrument FOV
        if self.ra is not None and self.dec is not None and self.radius is None:
            self.radius = 1

        # Search on RA/Dec/radius
        if self.ra is not None and self.dec is not None:
            # Convert radius to decimal degrees float
            if type(self.radius) is u.Quantity:
                radius = self.radius.to(u.deg).value
            else:
                radius = self.radius
            stmt = stmt.where(
                sa_angular_distance(
                    self.ra, self.dec, BurstCubeTOOModel.ra, BurstCubeTOOModel.dec
                )
                < radius
            )

        with Session(engine) as sess:
            result = sess.execute(stmt)
            self.entries = [
                BurstCubeTOOModelSchema.model_validate(r[0]) for r in result.fetchall()
            ]

        return True


# Short aliases for classes
TOORequests = BurstCubeTOORequests
TOO = BurstCubeTOO
TOOModelSchema = BurstCubeTOOModelSchema
TOOPostSchema = BurstCubeTOOPostSchema
TOOPutSchema = BurstCubeTOOPutSchema
