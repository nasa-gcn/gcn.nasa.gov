# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.


import logging
import os
import typing


def get_features() -> set[str]:
    return set(filter(bool, (os.environ.get("GCN_FEATURES") or "").upper().split(",")))


def feature(name: str) -> bool:
    """Return true if the given feature flag is enabled.

    Feature flags are configured by the environment variable GCN_FEATURES,
    which is a comma-separated list of enabled features.
    """
    return name.upper() in get_features()


def _die_for_env(key) -> typing.NoReturn:
    raise RuntimeError(f"environment variable {key} must be set")


def get_env_or_die(key: str) -> str:
    value = os.environ.get(key)
    if not value:
        _die_for_env(key)
    return value


def get_env_or_die_in_production(key: str) -> typing.Optional[str]:
    value = os.environ.get(key)
    arc_env = os.environ["ARC_ENV"]
    if not value:
        if arc_env == "production":
            _die_for_env(key)
        logging.warn(
            f"environment variable {key} must be set for production. Proceeding anyway since we are in {arc_env}"
        )
    return value
