import json
from datetime import datetime, timedelta
from functools import wraps
from typing import Callable, Union

from ..base.common import ACROSSAPIBase  # type: ignore
from ..functions import convert_to_dt
from ..version import API_VERSION
from .models import JobModel


def api_call_params(func: Callable, instance: ACROSSAPIBase) -> Union[str, bool]:
    """
    Convert parameters of job into a JSON format.

    Parameters
    ----------
    func : Any
        The function to be called.
    instance : ACROSSAPIBase
        The instance of the ACROSSAPIBase class.

    Returns
    -------
    Union[str, bool]
        The job parameters as a JSON string, or False if the function name is not recognized.
    """
    if func.__name__ == "get":
        params = instance._get_schema.model_validate(instance).model_dump()
        job_params = json.dumps({"get": params}, default=str)
    elif func.__name__ == "put":
        params = instance._put_schema.model_validate(instance).model_dump()
        job_params = json.dumps({"put": params}, default=str)
    elif func.__name__ == "delete":
        params = instance._del_schema.model_validate(instance).model_dump()
        job_params = json.dumps({"delete": params}, default=str)
    elif func.__name__ == "post":
        params = instance._post_schema.model_validate(instance).model_dump()
        job_params = json.dumps({"post": params}, default=str)
    else:
        return False
    return job_params


def register_job(func: Callable) -> Callable:
    """
    Decorator to record details of API job in api_jobs database.

    Parameters:
        func (Callable): The function to be decorated.

    Returns:
        Callable: The decorated function.

    """

    @wraps(func)
    def wrapper(*args, **kwargs):
        instance = args[0]

        # Record now
        began = datetime.utcnow()

        # Define type of request
        reqtype = f"{instance.api_name}__{func.__name__}"

        # Record parameters of job before running
        job_params = api_call_params(func, instance)

        # Process the query
        result = func(*args, **kwargs)

        # Write job details to DynamoDB
        job = JobModel(
            username=instance.username,
            reqtype=reqtype,
            apiversion=API_VERSION,
            began=began,
            created=datetime.utcnow(),
            expires=datetime.utcnow() + timedelta(seconds=instance._cache_time),
            params=job_params,
            result=instance.schema.model_dump_json(),
        )
        job.save()

        # Update API call with details
        instance.status.created = job.created
        instance.status.expires = job.expires

        return result

    return wrapper


def check_cache(func: Callable) -> Callable:
    """
    Decorator to record details of API job in api_jobs database.

    Parameters
    ----------
    func : function
        The function to be decorated.

    Returns
    -------
    function: func
        The decorated function.

    """

    @wraps(func)
    def wrapper(*args, **kwargs):
        instance = args[0]

        # Define type of request
        reqtype = f"{instance.api_name}__{func.__name__}"

        # Define parameters of job
        job_params = api_call_params(func, instance)

        # Find recent instances of jobs with the same type
        job = JobModel.get_by_username_param_reqtype_apiversion(
            username=instance.username,
            params=job_params,
            reqtype=reqtype,
            apiversion=API_VERSION,
        )

        if job is not None:
            # Check if job is still valid
            if convert_to_dt(job.expires) > datetime.utcnow():
                # Load the cached result
                instance.loads(job.result)
                instance.status.created = job.created
                instance.status.expires = job.expires
                return True

        result = func(*args, **kwargs)
        return result

    return wrapper
