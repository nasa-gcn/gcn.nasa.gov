# ACROSS API
#
# functions.py
#
# Various functions/classes used by code.

import re
from datetime import date, datetime, timedelta, timezone
from typing import Any

DATE_REGEX: str = (
    r"^[0-2]\d{3}[-/](0?[1-9]|1[012])[-/]([0][1-9]|[1-2][0-9]|3[0-1])+(\.\d+)?$"
)
DATETIME_REGEX: str = r"^[0-2]\d{3}-(0?[1-9]|1[012])-([0][1-9]|[1-2][0-9]|3[0-1]) ([0-9]:|[0-1][0-9]:|2[0-3]:)[0-5][0-9]:[0-5][0-9]+(\.\d+)?$"


def round_time(dt=None, roundTo=60) -> datetime:
    """Round a datetime object to any time lapse in seconds
    dt : datetime.datetime object, default now.
    roundTo : Closest number of seconds to round to, default 1 minute.
    Author: Thierry Husson 2012 - Use it as you want but don't blame me.
    """
    if dt is None:
        dt = datetime.now()
    if type(dt) is date:
        dt = datetime(dt.year, dt.month, dt.day, 0, 0, 0)
    seconds = (dt.replace(tzinfo=None) - dt.min).seconds
    rounding = (seconds + roundTo / 2) // roundTo * roundTo
    return dt + timedelta(0, rounding - seconds, -dt.microsecond)


def convert_to_dt(value: Any) -> datetime:
    """Convert various date formats to datetime"""
    if type(value) is str:
        if re.match(DATETIME_REGEX, value):
            if "." in value:
                # Do this because "fromisoformat" is restricted to 0, 3 or 6 decimal plaaces
                dtvalue = datetime.strptime(value, "%Y-%m-%d %H:%M:%S.%f")
            else:
                dtvalue = datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
        elif re.match(DATE_REGEX, value):
            dtvalue = datetime.strptime(f"{value} 00:00:00", "%Y-%m-%d %H:%M:%S")
        else:
            # Last ditch effort, try fromisoformat
            dtvalue = (
                datetime.fromisoformat(value)
                .astimezone(tz=timezone.utc)
                .replace(tzinfo=None)
            )
            return dtvalue
    elif type(value) is date:
        dtvalue = datetime.strptime(f"{value} 00:00:00", "%Y-%m-%d %H:%M:%S")
    elif type(value) is datetime:
        dtvalue = datetime.fromtimestamp(value.timestamp())
    else:
        dtvalue = value
    return dtvalue
