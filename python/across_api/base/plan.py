from datetime import datetime
from typing import Optional, Union

import astropy.units as u  # type: ignore
from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..api_db import engine, sa_angular_distance
from .common import ACROSSAPIBase
from .models import PlanEntryModelBase
from .schema import JobInfo, PlanEntryBase, PlanGetSchemaBase, PlanSchemaBase


class PlanBase(ACROSSAPIBase):
    """Base class for Plan API."""

    _schema = PlanSchemaBase
    _put_schema = PlanGetSchemaBase
    _get_schema = PlanGetSchemaBase
    _entry_model = PlanEntryModelBase
    _entry_schema = PlanEntryBase

    begin: Optional[datetime]
    end: Optional[datetime]
    obsid: Union[int, str, list, None]
    targetid: Union[int, list, None]
    ra: Optional[float]
    dec: Optional[float]
    radius: Optional[float]
    status: JobInfo

    def __getitem__(self, i) -> PlanEntryBase:
        return self.entries[i]

    def which_entry(self, dt: datetime) -> Optional[PlanEntryBase]:
        """Return a PlanEntry for a give datetime.

        Parameters
        ----------
        dt : datetime
            Time at which you are querying for a plan entry

        Returns
        -------
        Optional[PlanEntryBase]
            Return Plan Entry for a given time, or None if none exists
        """
        ent = [e for e in self.entries if e.end > dt and e.begin <= dt]
        if ent == []:
            return None
        return ent[0]

    def put(self) -> bool:
        """RESTful PUT implementation, replace existing entries with the ones given."""
        if len(self.entries) > 0:
            begin = self.entries[0].begin
            end = self.entries[-1].end
        else:
            return False

        # Remove existing entries for this date range and replace them with new ones
        with Session(engine) as sess:
            sess.query(self._entry_model).filter(
                self._entry_model.begin >= begin
            ).filter(self._entry_model.end <= end).delete()
            sess.add_all([self._entry_model(**e.model_dump()) for e in self.entries])
            sess.commit()

        # Reset entries once imported, so as not to report back them all when in the Response
        self.entries = []

        return True

    def get(self) -> bool:
        """Construct a database query for search parameters and read in Plan entries as result."""
        # Check if it validates
        if not self.validate_get():
            return False

        # Set plan_max
        with Session(engine) as sess:
            results = sess.query(func.max(self._entry_model.end))
            self.plan_max = results.scalar()

        # Check for empty database
        if self.plan_max is None:
            raise HTTPException(status_code=404, detail="No plan entries in database.")

        # Search Plan database
        if self.begin is not None and self.begin > self.plan_max:
            raise HTTPException(
                status_code=404,
                detail=f"No plan entries beyond {self.plan_max}, please try again later.",
            )

        # Start constructing the query
        command = select(self._entry_model)

        # Search between two date ranges
        if self.begin is not None and self.end is not None:
            command = command.where(self._entry_model.begin < self.end).where(
                self._entry_model.end > self.begin
            )

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
            command = command.where(
                sa_angular_distance(
                    self.ra, self.dec, self._entry_model.ra, self._entry_model.dec
                )
                < radius
            )

        if (
            hasattr(self, "obsid")
            and self.obsid is not None
            and hasattr(self._entry_model, "obsid")
        ):
            # Convert obsid to a list of one
            if type(self.obsid) is list:
                obsid = [obsid for obsid in self.obsid]
            else:
                obsid = [self.obsid]

            # Look for all obsids
            if obsid != [None]:
                command = command.filter(self._entry_model.obsid.in_(obsid))

        if (
            hasattr(self, "targetid")
            and self.targetid is not None
            and hasattr(self._entry_model, "targetid")
        ):
            # Convert targetid to a list of one
            targetid = self.targetid
            if type(self.targetid) is int:
                targetid = [self.targetid]

            # Look for all targetids (if no obsid given)
            elif targetid is not None and type(targetid) is list:
                command = command.filter(self._entry_model.targetid.in_(targetid))

        if command == select(self._entry_model):
            raise HTTPException(
                status_code=400,
                detail="Blank queries are not allowed. Please add filter criteria.",
            )

        # Make sure the ordering is correct
        command = command.order_by(self._entry_model.begin.desc())

        # Fetch from database
        with Session(engine) as sess:
            results = sess.execute(command)
            values = results.fetchall()
            self.entries = [self._entry_schema.model_validate(val[0]) for val in values]
        return True
