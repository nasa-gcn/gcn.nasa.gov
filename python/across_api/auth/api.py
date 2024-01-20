# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.


import os
from typing import Optional

import jwt
import requests
from authlib.integrations.base_client.errors import OAuthError  # type: ignore
from authlib.integrations.requests_client import OAuth2Session  # type: ignore
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from ..base.api import app
from .schema import AuthToken, VerifyAuth


class JWTBearer(HTTPBearer):
    token_endpoint: str
    jwks_uri: str

    def __init__(self):
        # Check that required environment variable is set
        if "COGNITO_USER_POOL_ID" not in os.environ:
            HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="COGNITO_USER_POOL_ID not set",
            )

        # Fetch the well-known config from Cognito
        user_pool_id = os.environ["COGNITO_USER_POOL_ID"]
        cognito_url = f"https://cognito-idp.{user_pool_id.split('_')[0]}.amazonaws.com/{user_pool_id}/"
        resp = requests.get(cognito_url + ".well-known/openid-configuration")
        try:
            resp.raise_for_status()
        except requests.exceptions.HTTPError as e:
            HTTPException(status_code=500, detail=str(e))

        # Find the token endpoint and jwks_uri from the well-known config
        well_known = resp.json()
        self.token_endpoint = well_known["token_endpoint"]
        self.jwks_uri = well_known["jwks_uri"]

        super().__init__()

    async def __call__(self, request: Request) -> None:
        credentials: Optional[HTTPAuthorizationCredentials] = await super().__call__(
            request
        )
        """Validate credentials if passed"""
        if credentials:
            # Fetch signing key from Cognito
            jwks_client = jwt.PyJWKClient(self.jwks_uri)
            try:
                signing_key = jwks_client.get_signing_key_from_jwt(
                    credentials.credentials
                )
            except jwt.DecodeError as e:
                raise HTTPException(
                    status_code=401, detail=f"Authentication error: {e}"
                )

            # Validate the credentials
            try:
                jwt.api_jwt.decode_complete(
                    credentials.credentials,
                    key=signing_key.key,
                    algorithms=["RS256"],
                )
            except jwt.InvalidSignatureError as e:
                raise HTTPException(
                    status_code=401, detail=f"Authentication error: {e}."
                )


security = JWTBearer()
JWTBearerDep = [Depends(security)]


@app.get("/auth/token")
async def get_authentication_token(client_id: str, client_secret: str) -> AuthToken:
    """Obtain an authorization token using GCN credentials."""
    session = OAuth2Session(client_id, client_secret, scope={})
    try:
        token = session.fetch_token(security.token_endpoint)
    except OAuthError:
        raise HTTPException(
            status_code=401, detail="Invalid client_id or client_secret."
        )
    return AuthToken(**token)


@app.get("/auth/verify", dependencies=JWTBearerDep)
async def verify_authentication() -> VerifyAuth:
    """Verify that the user is authenticated."""
    return VerifyAuth()
