import os

import aioboto3  # type: ignore[import]
from arc._lib import get_ports, use_aws  # type: ignore[import]


def dynamodb_resource():
    dynamodb_session = aioboto3.Session()
    if use_aws():
        return dynamodb_session.resource("dynamodb")
    else:
        port = get_ports()["tables"]
        region_name = os.environ.get("AWS_REGION", "us-east-1")
        return dynamodb_session.resource(
            "dynamodb", endpoint_url=f"http://localhost:{port}", region_name=region_name
        )
