# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from across_api.across.resolve import Resolve


def test_resolve_cds(expected_resolve_crab):
    resolve = Resolve(expected_resolve_crab.name)
    assert abs(resolve.ra - expected_resolve_crab.ra) < 0.1 / 3600
    assert abs(resolve.dec - expected_resolve_crab.dec) < 0.1 / 3600
    assert resolve.resolver == expected_resolve_crab.resolver


def test_resolve_antares(expected_resolve_ztf):
    resolve = Resolve(expected_resolve_ztf.name)
    assert abs(resolve.ra - expected_resolve_ztf.ra) < 0.1 / 3600
    assert abs(resolve.dec - expected_resolve_ztf.dec) < 0.1 / 3600
    assert resolve.resolver == expected_resolve_ztf.resolver
