from .schema import ConfigSchema


def set_observatory(obsdict: dict):
    """
    Decorator to set observatory configuration parameters for API classes.

    Parameters
    ----------
    obsdict
        Dictionary of observatory configuration parameters
    """

    def decorator(cls):
        # Set mission name of API class
        cls.mission = obsdict["mission"]["shortname"]
        key = cls.__name__.removeprefix(cls.mission).lower()
        cls.__tablename__ = f"{cls.mission.lower()}_{key}"

        # Set configuration parameters
        if key in obsdict.keys():
            # Set parameters for this thing
            for attr, value in obsdict[key].items():
                setattr(cls, attr, value)

        # Store full mission config in an class attribute
        cls.config = ConfigSchema(**obsdict)

        return cls

    return decorator
