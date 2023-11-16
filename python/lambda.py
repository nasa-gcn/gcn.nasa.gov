# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.


from fastapi import FastAPI
from mangum import Mangum

from env import feature

app = FastAPI()


@app.get("/")
async def example():
    return {"greeting": "Hello, world!"}


if feature("LABS"):
    handler = Mangum(app, api_gateway_base_path="/labs/api", lifespan="off")
else:
    handler = lambda *_, **__: {"statusCode": 404}
