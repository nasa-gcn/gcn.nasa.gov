from across_api.across.resolve import Resolve


def test_resolve_cds():
    resolve = Resolve("Crab")
    assert abs(resolve.ra - 83.6287) < 0.1 / 3600
    assert abs(resolve.dec - 22.0147) < 0.1 / 3600
    assert resolve.resolver == "CDS"


def test_resolve_antares():
    resolve = Resolve("ZTF17aabwgbz")
    assert abs(resolve.ra - 95.85514670221599) < 0.1 / 3600
    assert abs(resolve.dec - -12.322666705084146) < 0.1 / 3600
    assert resolve.resolver == "ANTARES"
