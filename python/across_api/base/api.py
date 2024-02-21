# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

"""
Base API definitions for ACROSS API. This module is imported by all other API
modules.
"""

from fastapi import FastAPI


# FastAPI app definition
app = FastAPI(
    title="ACROSS API",
    summary="Astrophysics Cross-Observatory Science Support (ACROSS).",
    description="API providing information on various NASA missions to aid in coordination of large observation efforts.",
    contact={
        "email": "support@gcn.nasa.gov",
    },
    root_path="/labs/api/v1",
)
