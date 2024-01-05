# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from mangum import Mangum

from across_api.base.api import app
import across_api.across.api  # noqa F401
import across_api.burstcube.api  # noqa F401
import across_api.swift.api  # noqa F401

from env import feature

if feature("LABS"):
    handler = Mangum(app, api_gateway_base_path="/labs/api/v1", lifespan="off")
else:

    def handler(*_, **__):  # type: ignore
        return {"statusCode": 404}
