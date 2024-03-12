# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from typing import Optional

from ..base.common import ACROSSAPIBase
from .schema import HelloGetSchema, HelloSchema


class Hello(ACROSSAPIBase):
    """Sample ACROSS API Class

    Parameters
    ----------
    name
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
        name
            Your name
        """
        self.name = name

    async def get(self) -> bool:
        """
        GET method for ACROSS API Hello class.

        Returns
        -------
            True if this worked (it always should)
        """
        if self.name is None:
            self.hello = "Hello there!"
            return True
        self.hello = f"Hello there {self.name}!"
        return True
