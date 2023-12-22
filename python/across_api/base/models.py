# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from datetime import datetime, timedelta

from arc import tables  # type: ignore
from pydantic import computed_field

from .schema import BaseSchema


class TLEEntry(BaseSchema):
    """
    Represents a TLE entry in the database.
    """

    __tablename__ = "acrossapi_tle"
    satname: str  # Partition Key
    tle1: str
    tle2: str

    @computed_field  # type: ignore[misc]
    @property
    def epoch(self) -> datetime:
        """
        Calculate the Epoch of the TLE (Sort Key).

        Returns
        -------
            The calculated epoch of the TLE.
        """
        tleepoch = self.tle1.split()[3]
        year, day_of_year = int(f"20{tleepoch[0:2]}"), float(tleepoch[2:])
        return datetime(year, 1, 1) + timedelta(day_of_year - 1)

    @classmethod
    def find_tles_between_epochs(cls, satname, start_epoch, end_epoch):
        """Find TLE entries between two epochs.

        Arguments
        ---------
        name
            The name of the TLE entry.
        start_epoch
            The start time over which to search for TLE entries.
        end_epoch
            The end time over which to search for TLE entries.

        Returns
        -------
            A list of TLEEntry objects between the specified epochs.
        """
        table = tables.table(cls.__tablename__)

        response = table.query(
            KeyConditionExpression="satname = :satname AND epoch BETWEEN :start_epoch AND :end_epoch",
            ExpressionAttributeValues={
                ":satname": satname,
                ":start_epoch": str(start_epoch),
                ":end_epoch": str(end_epoch),
            },
        )
        items = response["Items"]
        tles = [cls(**item) for item in items]
        tles.sort(key=lambda x: x.epoch)
        return tles

    def write(self):
        """Write the TLE entry to the database."""
        table = tables.table(self.__tablename__)
        table.put_item(Item=self.model_dump(mode="json"))
