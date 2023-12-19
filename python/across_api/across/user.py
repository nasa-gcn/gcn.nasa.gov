from secrets import token_urlsafe

from fastapi import HTTPException

from ..base.common import ACROSSAPIBase
from .models import UserModel


def check_api_key(anon: bool = True, userlevel: int = 0, requser: list = []):
    """Decorator to check api_key is valid. Also can disable use
    of anonymous user, and require a minimum userlevel, or
    require a specific username.

    Arguments
    ---------

    anon : bool, optional
        Flag to allow or disallow anonymous usage. Defaults to True.
    userlevel : int, optional
        Minimum user level required. Defaults to 0.
    requser : list, optional
        List of usernames allowed to access the API call. Defaults to [].

    Returns
    -------
    function
        Decorated function.

    Raises
    ------
    HTTPException
        If the API call is not allowed for the user, or if the API key is not
        valid, or if the user level is insufficient.
    """

    def Inner(func):
        def wrapper(*args, **kwargs):
            good = True
            # Fetch the instance
            instance = args[0]  # First argument to method is "self"
            # If this API cares about authentication...
            if anon is not True:
                good = True
                # If username is given as 'anonymous' make sure this is allowed
                if requser != []:
                    if instance.username not in requser:
                        raise HTTPException(
                            status_code=401,
                            detail="API call not allowed for this user.",
                        )
                if instance.username == "anonymous":
                    if anon is not True or userlevel > 0:
                        good = False
                        raise HTTPException(
                            status_code=401,
                            detail="API call does not support anonymous usage.",
                        )
                else:
                    # Check the api_key value matches the database stored value
                    apikey = APIUserInfo(username=instance.username)
                    apikey.get()

                    if apikey.api_key != instance.api_key:
                        good = False
                        raise HTTPException(
                            status_code=401, detail="API key not valid."
                        )
                    # Check the user has sufficient priviledges
                    elif apikey.userlevel < userlevel:
                        good = False
                        raise HTTPException(
                            status_code=401, detail="Insufficient user level."
                        )

            if good:
                return func(*args, **kwargs)
            else:
                instance.entries = None  # Clear out any results if this didn't work
                return None

        return wrapper

    return Inner


class APIUserInfo(ACROSSAPIBase):
    """
    Class for holding basic information about an API User: username and
    api_key. Exposes the usual GET, POST, PUT, and DELETE methods for
    adding, updating, and deleting users.

    Parameters
    ----------
    username : str, optional
        The username of the API user, by default "anonymous"

    Attributes
    ----------
    username : str
        The username of the API user.
    api_key : str
        The API key associated with the user.
    userlevel : int
        The user level. Defaults to 1.

    Methods
    -------
    get
        Get information for a user, including userlevel and api_key.
    post
        Add a user to the usertable. Creates a random api key for the user
        if one isn't given.
    put
        Update a user in the usertable. Create a random api key for the user.
    delete
        Delete a user from the usertable.
    """

    username: str
    api_key: str
    userlevel: int

    def __init__(self, username="anonymous"):
        ACROSSAPIBase.__init__(self)
        self.username = username
        self.api_key = "anonymous"
        self.userlevel = 0

    def get(self) -> bool:
        """
        Perform a query on the supplied user name.

        Returns
        -------
        bool
            True if the query was successful, False otherwise.
        """
        # If we're anonymous, then just return api_key as 'anonymous'
        if self.username == "anonymous":
            self.api_key = "anonymous"
            return True

        # Look for matching users in the database
        user = UserModel.get_by_key(value=self.username, key="username")
        if user is not None:
            self.api_key = user.api_key
            self.userlevel = user.userlevel
            return True

        return False

    def post(self):
        """
        Add a user to the usertable. Create a random api key for the user.

        Returns
        -------
        bool
            True if the user is successfully added, False otherwise.

        Raises
        ------
        HTTPException
            If the username already exists in the user table.
        """
        # Check if there's already a user with this name
        if UserModel.get_by_key(value=self.username, key="username") is not None:
            raise HTTPException(status_code=400, detail="Username already exists.")

        # Create API_KEY
        self.api_key = token_urlsafe(30)
        newuser = UserModel(username=self.username, api_key=self.api_key, userlevel=0)
        newuser.save()
        self.api_key = newuser.api_key
        return True

    def put(self):
        """
        Update a user in the usertable. Create a random api key for the user.

        Returns
        -------
        bool
            True if the user was successfully updated.

        Raises
        ------
        HTTPException
            If the username does not exist.
        """
        # Check if there's already a user with this name
        user = UserModel.get_by_key(value=self.username, key="username")
        if user is None:
            raise HTTPException(status_code=404, detail="Username does not exist.")

            # Create API_KEY
            newuser = UserModel(
                username=self.username, api_key=self.api_key, userlevel=self.userlevel
            )
            newuser.save()
            self.api_key = newuser.api_key
            return True

    def delete(self):
        """
        Delete a user from the usertable.

        Returns
        -------
        bool
            True if the user is successfully deleted.

        Raises
        ------
        HTTPException
            If the username does not exist.
        """
        # Check if there's already a user with this name
        user = UserModel.get_by_key(value=self.username, key="username")
        if user is None:
            raise HTTPException(status_code=404, detail="Username does not exist.")

        # Delete the user
        UserModel.delete_entry(value=self.username, key="username")
        return True

    @classmethod
    def get_api_key(cls, username: str):
        """
        Get the API key for a user.

        Parameters
        ----------
        username : str
            The username of the user.

        Returns
        -------
        str
            The API key of the user.

        Raises
        ------
        HTTPException
            If the username does not exist.
        """
        user = UserModel.get_by_key(value=username, key="username")
        if user is None:
            raise HTTPException(status_code=404, detail="Username does not exist.")
        return user.api_key
