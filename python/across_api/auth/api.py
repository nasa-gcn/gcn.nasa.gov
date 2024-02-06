# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.


import os
from typing import Annotated, Any

from jose import jwt
from jose.exceptions import JWTError
import httpx  # type: ignore
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer, SecurityScopes

from ..base.api import app
from .schema import VerifyAuth


bearer = HTTPBearer(
    scheme_name="ACROSS API Authorization",
    description="Enter your access token.",
    auto_error=True,
)


async def issuer() -> dict[str, Any]:
    """Discover OpenID Connect issuer configuration."""
    # Configure URL from IdP
    user_pool_id = os.environ.get("COGNITO_USER_POOL_ID")
    if user_pool_id is not None:
        provider_url = f"https://cognito-idp.{user_pool_id.split('_')[0]}.amazonaws.com/{user_pool_id}/"
    elif os.environ.get("ARC_ENV") == "testing":
        provider_url = f"http://localhost:{os.environ.get('ARC_OIDC_IDP_PORT')}/"
    else:
        raise RuntimeError(
            "Environment variable COGNITO_USER_POOL_ID must be defined in production.",
        )

    # Fetch the well-known config from the IdP
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{provider_url}.well-known/openid-configuration")
    resp.raise_for_status()
    return resp.json()


async def jwks(issuer: Annotated[dict[str, Any], Depends(issuer)]) -> dict[str, Any]:
    """Fetch JSON Web Key signature set from the OpenID Connect issuer."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(issuer["jwks_uri"])
    resp.raise_for_status()
    return resp.json()


async def claims(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer)],
    issuer: Annotated[dict[str, Any], Depends(issuer)],
    jwks: Annotated[dict[str, Any], Depends(jwks)],
) -> dict[str, Any]:
    """Verify and return the claims in the request's access token."""
    header = jwt.get_unverified_header(credentials.credentials)
    for signing_key in jwks["keys"]:
        if signing_key["kid"] == header["kid"]:
            break
    else:
        raise HTTPException(
            status_code=401, detail="Authentication error: Invalid key."
        )

    # Validate the credentials
    try:
        return jwt.decode(
            credentials.credentials,
            key=signing_key,
            algorithms=issuer["id_token_signing_alg_values_supported"],
        )
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Authentication error: {e}")


async def scopeauthorize(
    security_scopes: SecurityScopes,
    access_token: Annotated[dict, Depends(claims)],
):
    # retrieve scopes from access token
    scopes = access_token.get("scope", "")

    # assuming the jwt scopes will be comma separated
    token_scopes = scopes.split(",")

    # raise exception if user.role not in endpoint scope
    if not all(scope in token_scopes for scope in security_scopes.scopes):
        raise HTTPException(
            status_code=401,
            detail="Bearer token scope(s) not in endpoint scope",
            headers={"WWW-Authenticate": "Bearer"},
        )


@app.get("/auth/verify", dependencies=[Security(scopeauthorize, scopes=[])])
async def verify_authentication() -> VerifyAuth:
    """Verify that the user is authenticated."""
    return VerifyAuth()
