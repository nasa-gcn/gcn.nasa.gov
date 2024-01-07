# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from typing import Optional

from ..base.schema import BaseSchema


class HelloSchema(BaseSchema):
    """
    Schema defining the returned attributes of the ACROSS API Hello class.

    Attributes
    ----------
    hello
        The greeting message.
    """

    hello: str


class HelloGetSchema(BaseSchema):
    """
    Schema to validate input parameters of ACROSS API Hello class.

    Parameters
    ----------
    name
        The name parameter for the Hello class.

    Attributes
    ----------
    name
        The name parameter for the Hello class.

    """

    name: Optional[str] = None


class ResolveSchema(BaseSchema):
    """
    Schema for resolving astronomical coordinates.

    Parameters
    ----------
    ra
        Right ascension coordinate.
    dec
        Declination coordinate.
    resolver
        Resolver used for resolving the coordinates.
    """

    ra: float
    dec: float
    resolver: str


class ResolveGetSchema(BaseSchema):
    """Schema defines required parameters for a GET

    Parameters
    ----------
    name
        The name of the source to be resolved into coordinates.

    """

    name: str
