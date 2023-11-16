# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.


import os


def get_features() -> set[str]:
    return set(filter(bool, (os.environ.get("GCN_FEATURES") or "").upper().split(",")))


def feature(name: str) -> bool:
    """Return true if the given feature flag is enabled.

    Feature flags are configured by the environment variable GCN_FEATURES,
    which is a comma-separated list of enabled features.
    """
    return name.upper() in get_features()
