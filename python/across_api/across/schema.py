from datetime import datetime
from typing import Optional

from ..base.schema import BaseSchema, JobInfo


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
    status: JobInfo


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
    status: JobInfo


class ResolveGetSchema(BaseSchema):
    """Schema defines required parameters for a GET

    Parameters
    ----------
    name : str
        The name of the source to be resolved into coordinates.

    """

    name: str


class JobSchema(BaseSchema):
    """
    Full return of Job Information for ACROSSAPIJobs

    Parameters
    ----------
    username : str
        The username associated with the job.
    jobnumber : str, optional
        The job number.
    reqtype : str
        The request type.
    apiversion : str
        The API version.
    began : datetime
        The start time of the job.
    created : datetime
        The creation time of the job.
    expires : datetime
        The expiration time of the job.
    params : str
        The parameters of the job.
    result : str, optional
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
