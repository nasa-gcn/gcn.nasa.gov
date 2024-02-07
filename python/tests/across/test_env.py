# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.

from env import feature, get_features


def test_features_undefined(monkeypatch):
    monkeypatch.delenv("GCN_FEATURES", raising=False)
    assert len(get_features()) == 0
    assert not feature("FOO")


def test_features_empty_string(monkeypatch):
    monkeypatch.setenv("GCN_FEATURES", "")
    assert len(get_features()) == 0
    assert not feature("FOO")


def test_features(monkeypatch):
    monkeypatch.setenv("GCN_FEATURES", ",,FOO,,bar,")
    assert len(get_features()) == 2
    assert feature("foo")
    assert feature("BAR")
    assert not feature("BAT")
