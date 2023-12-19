from typing import Optional

from ..base.schema import BaseSchema


class HelloSchema(BaseSchema):
    """
    Schema defining the returned attributes of the ACROSS API Hello class.

    Attributes
    ----------
    hello : str
        The greeting message.
    status : JobInfo
        The status of the job.
    """

    hello: str


class HelloGetSchema(BaseSchema):
    """
    Schema to validate input parameters of ACROSS API Hello class.

    Parameters
    ----------
    name : str, optional
        The name parameter for the Hello class.

    Attributes
    ----------
    name : str or None
        The name parameter for the Hello class.

    """

    name: Optional[str] = None


class ResolveSchema(BaseSchema):
    """
    Schema for resolving astronomical coordinates.

    Parameters
    ----------
    ra : float
        Right ascension coordinate.
    dec : float
        Declination coordinate.
    resolver : str
        Resolver used for resolving the coordinates.
    status : JobInfo
        Information about the job status.
    """

    ra: float
    dec: float
    resolver: str


class ResolveGetSchema(BaseSchema):
    """Schema defines required parameters for a GET

    Parameters
    ----------
    name : str
        The name of the source to be resolved into coordinates.

    """

    name: str
