# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.


import os
from typing import Any, Annotated, Optional

from jose import jwt
from jose.exceptions import JWTError
import httpx  # type: ignore
from fastapi import Depends, HTTPException, Request, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer, SecurityScopes

from ..base.api import app
from .schema import VerifyAuth


class JWTBearer(HTTPBearer):
    def __init__(self, **kwargs):
        # Configure URL from IdP
        user_pool_id = os.environ.get("COGNITO_USER_POOL_ID")
        if user_pool_id is not None:
            self.provider_url = f"https://cognito-idp.{user_pool_id.split('_')[0]}.amazonaws.com/{user_pool_id}/"
        elif os.environ.get("ARC_ENV") == "testing":
            self.provider_url = (
                f"http://localhost:{os.environ.get('ARC_OIDC_IDP_PORT')}/"
            )
        else:
            raise RuntimeError(
                "Environment variable COGNITO_USER_POOL_ID must be defined in production.",
            )

        super().__init__(**kwargs)

    async def __call__(self, request: Request) -> Optional[dict]:  # type: ignore
        credentials: Optional[HTTPAuthorizationCredentials] = await super().__call__(
            request
        )

        """Validate credentials if passed"""
        if credentials:
            # Fetch the well-known config from the IdP
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    self.provider_url + ".well-known/openid-configuration"
                )
            resp.raise_for_status()

            # Find the jwks_uri and token algorithms from the well-known config
            well_known = resp.json()
            jwks_uri = well_known["jwks_uri"]
            token_alg = well_known["id_token_signing_alg_values_supported"]

            # Fetch signing key from Cognito
            async with httpx.AsyncClient() as client:
                resp = await client.get(jwks_uri)
            jwks_data = resp.json()
            header = jwt.get_unverified_header(credentials.credentials)

            signing_key = None
            for key in jwks_data["keys"]:
                if "kid" in header.keys():
                    if key["kid"] == header["kid"]:
                        signing_key = key
                        break
            if signing_key is None:
                raise HTTPException(
                    status_code=401, detail="Authentication error: Invalid key."
                )

            # Validate the credentials
            try:
                return jwt.decode(
                    credentials.credentials,
                    key=signing_key,
                    algorithms=token_alg,
                )
            except JWTError as e:
                raise HTTPException(
                    status_code=401, detail=f"Authentication error: {e}"
                )
        else:
            raise AssertionError("No credentials passed.")

        return {}


JWTBearerSecurity = JWTBearer(
    scheme_name="ACROSS API Authorization",
    description="Enter your access token.",
)


async def ScopeAuthorize(
    security_scopes: SecurityScopes,
    access_token: Annotated[dict, Depends(JWTBearerSecurity)],
):
    valid = False
    scopes = access_token.get("scope", "")

    # assuming the jwt scopes will be comma separated
    token_scopes = scopes.split(",")

    # check if user scopes is in endpoint scope
    if len(security_scopes.scopes):
        valid = any(scope in security_scopes.scopes for scope in token_scopes)
    else:  # endpoint has no scopes
        valid = True

    # raise exception if user.role not in endpoint scope
    if not valid:
        raise HTTPException(
            status_code=401,
            detail="Bearer token scope(s) not in endpoint scope",
            headers={"WWW-Authenticate": "Bearer"},
        )


@app.get("/auth/verify", dependencies=[Security(ScopeAuthenticate, scopes=[])])
async def verify_authentication() -> VerifyAuth:
    """Verify that the user is authenticated."""
    return VerifyAuth()
