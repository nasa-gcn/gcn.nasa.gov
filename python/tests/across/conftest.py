# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

import pytest


class ExpectedResolve:
    def __init__(self, name: str, ra: float, dec: float, resolver: str):
        self.name = name
        self.ra = ra
        self.dec = dec
        self.resolver = resolver


@pytest.fixture
def expected_resolve_crab():
    return ExpectedResolve(name="Crab", ra=83.6287, dec=22.0147, resolver="CDS")


@pytest.fixture
def expected_resolve_ztf():
    return ExpectedResolve(
        name="ZTF17aabwgbz",
        ra=95.85514670221599,
        dec=-12.322666705084146,
        resolver="ANTARES",
    )
