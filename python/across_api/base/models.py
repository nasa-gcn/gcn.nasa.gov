from typing import Any

from boto3.dynamodb.conditions import Key  # type: ignore
from .schema import BaseSchema

from ..api_db import dydbtable


class DynamoDBBase(BaseSchema):
    __tablename__: str

    def save(self) -> None:
        table = dydbtable(self.__tablename__)
        table.put_item(Item=self.model_dump())

    @classmethod
    def get_by_key(cls, value: str, key: str) -> Any:
        table = dydbtable(cls.__tablename__)
        response = table.query(KeyConditionExpression=Key(key).eq(value))
        items = response["Items"]
        if items:
            item = items[0]
            return cls(**item)
        return None

    @classmethod
    def delete_entry(cls, value: Any, key: str) -> bool:
        table = dydbtable(cls.__tablename__)
        return table.delete_item(Key={key: value})
