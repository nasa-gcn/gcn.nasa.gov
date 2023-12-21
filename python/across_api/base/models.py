from datetime import datetime, timedelta
from typing import Any

from boto3.dynamodb.conditions import Key  # type: ignore
from pydantic import computed_field

from arc import tables  # type: ignore
from .schema import BaseSchema


class DynamoDBBase:
    __tablename__: str

    def write(self):
        table = tables.table(self.__tablename__)
        table.put_item(Item=self.model_dump(mode="json"))

    @classmethod
    def delete(cls, value: Any, key: str) -> bool:
        table = tables.table(cls.__tablename__)
        return table.delete_item(Key={key: value})


class TLEEntry(BaseSchema, DynamoDBBase):
    """Base for TLEEntry"""

    __tablename__ = "acrossapi_tle"
    name: str  # Partition Key
    tle1: str
    tle2: str

    @computed_field  # type: ignore[misc]
    @property
    def epoch(self) -> datetime:
        """Calculate Epoch of TLE (Sort Key)"""
        tleepoch = self.tle1.split()[3]
        year, day_of_year = int(f"20{tleepoch[0:2]}"), float(tleepoch[2:])
        return datetime(year, 1, 1) + timedelta(day_of_year - 1)

    @classmethod
    def find_tles_between_epochs(cls, name, start_epoch, end_epoch):
        table = tables.table(cls.__tablename__)

        response = table.query(
            KeyConditionExpression=Key("name").eq(name)
            & Key("epoch").between(str(start_epoch), str(end_epoch))
        )
        items = response["Items"]
        tles = [cls(**item) for item in items]
        tles.sort(key=lambda x: x.epoch)
        return tles
