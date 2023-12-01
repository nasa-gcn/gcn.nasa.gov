from datetime import datetime
from typing import Optional

from ..base.schema import BaseSchema, JobInfo


class HelloSchema(BaseSchema):
    """
    Schema defining the returned attributes of the  ACROSS API Hello class.
    """

    hello: str
    status: JobInfo


class HelloGetSchema(BaseSchema):
    """
    Schema to validate input parameters of ACROSS API Hello class.
    """

    name: Optional[str] = None


class ResolveSchema(BaseSchema):
    ra: float
    dec: float
    resolver: str
    status: JobInfo


class ResolveGetSchema(BaseSchema):
    """Schema defines required parameters for a GET"""

    name: str


class JobSchema(BaseSchema):
    """Full return of Job Information for ACROSSAPIJobs"""

    username: str
    jobnumber: Optional[str] = None
    reqtype: str
    apiversion: str
    began: datetime
    created: datetime
    expires: datetime
    params: str
    result: Optional[str] = None
