# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

import pytest
from across_api.across.resolve import Resolve


@pytest.mark.asyncio
async def test_resolve_cds(expected_resolve_crab):
    resolve = Resolve(expected_resolve_crab.name)
    await resolve.get()
    assert abs(resolve.ra - expected_resolve_crab.ra) < 0.1 / 3600
    assert abs(resolve.dec - expected_resolve_crab.dec) < 0.1 / 3600
    assert resolve.resolver == expected_resolve_crab.resolver


@pytest.mark.asyncio
async def test_resolve_antares(expected_resolve_ztf):
    resolve = Resolve(expected_resolve_ztf.name)
    await resolve.get()
    assert abs(resolve.ra - expected_resolve_ztf.ra) < 0.1 / 3600
    assert abs(resolve.dec - expected_resolve_ztf.dec) < 0.1 / 3600
    assert resolve.resolver == expected_resolve_ztf.resolver
