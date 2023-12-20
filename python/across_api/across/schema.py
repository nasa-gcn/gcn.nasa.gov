from datetime import datetime
from typing import Optional

from ..base.schema import BaseSchema, JobInfo


class HelloSchema(BaseSchema):
    """
    Schema defining the returned attributes of the ACROSS API Hello class.

    Attributes
    ----------
    hello
        The greeting message.
    status
        The status of the job.
    """

    hello: str
    status: JobInfo


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
    status
        Information about the job status.
    """

    ra: float
    dec: float
    resolver: str
    status: JobInfo


class ResolveGetSchema(BaseSchema):
    """Schema defines required parameters for a GET

    Parameters
    ----------
    name
        The name of the source to be resolved into coordinates.

    """

    name: str


class JobSchema(BaseSchema):
    """
    Full return of Job Information for ACROSSAPIJobs

    Parameters
    ----------
    username
        The username associated with the job.
    jobnumber
        The job number.
    reqtype
        The request type.
    apiversion
        The API version.
    began
        The start time of the job.
    created
        The creation time of the job.
    expires
        The expiration time of the job.
    params
        The parameters of the job.
    result
        The result of the job.
    """

    username: str
    jobnumber: Optional[str] = None
    reqtype: str
    apiversion: str
    began: datetime
    created: datetime
    expires: datetime
    params: str
    result: Optional[str] = None
