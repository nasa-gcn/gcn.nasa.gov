from dataclasses import dataclass
from datetime import datetime
from typing import Any

from boto3.dynamodb.conditions import Key  # type: ignore
from sqlalchemy import DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from ..api_db import dynamodb


class PlanEntryModelBase:
    """Base for PlanEntry."""

    begin: Mapped[datetime] = mapped_column(DateTime(timezone=False), primary_key=True)
    end: Mapped[datetime] = mapped_column(
        DateTime(
            timezone=False,
        )
    )
    targname: Mapped[str] = mapped_column(String(30))
    ra: Mapped[float] = mapped_column(Float())
    dec: Mapped[float] = mapped_column(Float())
    exposure: Mapped[int] = mapped_column(Integer())


class DynamoDBBase:
    __tablename__: str

    def save(self):
        table = dynamodb.Table(self.__tablename__)
        table.put_item(Item=self.model_dump())

    @classmethod
    def get_by_key(cls, value: str, key: str):
        table = dynamodb.Table(cls.__tablename__)
        response = table.query(KeyConditionExpression=Key(key).eq(value))
        items = response["Items"]
        if items:
            item = items[0]
            return cls(**item)
        return None

    @classmethod
    def delete_entry(cls, value: Any, key: str) -> bool:
        table = dynamodb.Table(cls.__tablename__)
        return table.delete_item(Key={key: value})


@dataclass
class TLEEntryModelBase(DynamoDBBase):
    """Base for TLEEntry"""

    __tablename__ = ""
    epoch: str
    tle1: str
    tle2: str

    @classmethod
    def create_table(cls):
        table = dynamodb.create_table(
            TableName=cls.__tablename__,
            KeySchema=[{"AttributeName": "epoch", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "epoch", "AttributeType": "S"}],
            ProvisionedThroughput={"ReadCapacityUnits": 5, "WriteCapacityUnits": 5},
        )
        table.wait_until_exists()
        print("Database created.")

    @classmethod
    def find_keys_between_epochs(cls, start_epoch, end_epoch):
        table = dynamodb.Table(cls.__tablename__)
        response = table.scan(
            FilterExpression=Key("epoch").between(str(start_epoch), str(end_epoch))
        )
        items = response["Items"]
        tles = [cls(**item) for item in items]
        tles.sort(key=lambda x: x.epoch)
        return tles
