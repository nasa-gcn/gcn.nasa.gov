from fastapi import FastAPI

app = FastAPI(
    title="ACROSS API",
    summary="Astrophysics Cross-Observatory Science Support (ACROSS).",
    description="API providing information on various NASA missions to aid in coordination of large observation efforts.",
    version="1.0.0",
    contact={
        "name": "Jamie Kennea",
        "email": "jak51@psu.edu",
    },
    root_path="/labs/api/v1",
)
