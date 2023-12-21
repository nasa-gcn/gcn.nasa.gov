from ..base.models import DynamoDBBase  # type: ignore
from ..base.schema import BaseSchema


class UserModel(BaseSchema, DynamoDBBase):
    """
    Represents a user in the system.

    Attributes
    ----------
    username: str
        The username of the user.
    api_key: str
        The API key associated with the user.
    userlevel: int
        The user level. Defaults to 1.
    """

    __tablename__ = "acrossapi_users"

    username: str
    api_key: str
    userlevel: int = 1
