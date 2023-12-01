from typing import Optional

from ..base.common import ACROSSAPIBase
from ..base.schema import JobInfo
from .jobs import check_cache, register_job
from .schema import HelloGetSchema, HelloSchema


class Hello(ACROSSAPIBase):
    """Sample ACROSS API Class

    Parameters
    ----------
    name : str
        Your name, if you wish to give it
    """

    # Associate the two Schema with the class
    _schema = HelloSchema
    _get_schema = HelloGetSchema

    # What mission is this class associated with
    mission = "ACROSS"

    def __init__(self, name: Optional[str] = None):
        """Class initialization

        Parameters
        ----------
        name : str
            Your name
        """
        self.name = name
        self.status: JobInfo = JobInfo()
        if self.validate_get():
            self.get()

    @check_cache
    @register_job
    def get(self) -> bool:
        """
        GET method for ACROSS API Hello class.

        Returns
        -------
        bool
            True if this worked
        """
        if self.name is None:
            self.hello = "Hello there!"
            return True
        self.hello = f"Hello there {self.name}!"
        return True
