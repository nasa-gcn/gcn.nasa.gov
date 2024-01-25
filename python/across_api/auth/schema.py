from ..base.schema import BaseModel


class VerifyAuth(BaseModel):
    status: str = "success"
