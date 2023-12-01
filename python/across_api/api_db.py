import os

import boto3  # type: ignore
import numpy as np
from sqlalchemy import Function, create_engine, func
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm.attributes import InstrumentedAttribute

from .api_secrets import (
    ACROSS_DB_HOST,
    ACROSS_DB_NAME,
    ACROSS_DB_PASSWD,
    ACROSS_DB_PORT,
    ACROSS_DB_USER,
)

# Database connection string
DATABASE = f"postgresql://{ACROSS_DB_USER}:{ACROSS_DB_PASSWD}@{ACROSS_DB_HOST}:{ACROSS_DB_PORT}/{ACROSS_DB_NAME}"

engine = create_engine(DATABASE, echo=False)


if os.environ.get("ARC_SANDBOX") is None:
    # DyanmoDB connection
    session = boto3.session.Session()  # profile_name="across-local-2")
    dynamodb = session.resource("dynamodb", region_name="us-east-1")
else:
    session = boto3.session.Session()  # profile_name="across-local-2")
    dynamodb = session.resource("dynamodb", endpoint_url="http://localhost:5555")
    print("ACROSSAPI: Using local DynamoDB instance.")


class Base(DeclarativeBase):
    @classmethod
    def create_table(cls) -> bool:
        """Create the table if it does not exist"""
        cls.metadata.create_all(engine)
        return True


def sa_angular_distance(
    ra: float, dec: float, racol: InstrumentedAttribute, deccol: InstrumentedAttribute
) -> Function:
    """
    SQLAlchemy function to calculate angular distance between
    RA/Dec in a database and a given RA/Dec in decimal degrees.

    Parameters
    ----------
    ra : float
        Right ascension in decimal degrees
    dec : float
        Declination in decimal degrees
    racol : InstrumentedAttribute
        SQLAlchemy model attribute
    deccol : InstrumentedAttribute
        SQLAlchemy model attribute

    Returns
    -------
    Function
        SQLAlchemy function calculating angular distance
    """
    # Convert arguments to radians
    ra = np.radians(ra)
    dec = np.radians(dec)

    # Return function to calculate angular separation
    return func.degrees(
        func.acos(
            func.cos(func.radians(deccol))
            * func.cos(dec)
            * func.cos(ra - func.radians(racol))
            + func.sin(func.radians(deccol)) * func.sin(dec)
        )
    )
