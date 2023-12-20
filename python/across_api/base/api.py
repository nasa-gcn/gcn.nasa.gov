from fastapi import FastAPI

app = FastAPI(
    title="ACROSS API",
    summary="Astrophysics Cross-Observatory Science Support (ACROSS).",
    description="API providing information on various NASA missions to aid in coordination of large observation efforts.",
    version="1.0.0",
    contact={
        "email": "support@gcn.nasa.gov",
    },
    root_path="/labs/api/v1",
)
