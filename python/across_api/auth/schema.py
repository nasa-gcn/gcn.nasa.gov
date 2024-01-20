from ..base.schema import BaseModel


class AuthToken(BaseModel):
    """Pydantic Model for OIDC Auth Token"""

    access_token: str
    expires_in: int
    token_type: str
    expires_at: int


class VerifyAuth(BaseModel):
    status: str = "success"
