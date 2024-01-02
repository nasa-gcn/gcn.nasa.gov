# ACROSS API
#
# functions.py
#
# Various functions/classes used by code.


from datetime import date, datetime, timedelta

import astropy.units as u  # type: ignore
from astropy.time import Time  # type: ignore


def round_datetime(dt=None, roundTo=60) -> datetime:
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


def round_time(t: Time, roundTo=60 * u.s) -> Time:
    """Round a astropy Time object to any time lapse in seconds
    dt : datetime.datetime object, default now.
    roundTo : Closest number of seconds to round to, default 1 minute."""
    return Time(
        round_datetime(t.datetime, roundTo.to(u.s).value),
        format="datetime",
        scale="utc",
    )
