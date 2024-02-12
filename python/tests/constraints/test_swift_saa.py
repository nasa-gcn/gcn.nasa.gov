# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.


import numpy as np


def test_swift_saa(swift_ephem, swiftapi_saa_entries, swift_saa_entries):
    # Convert this to a list of start/stop windows
    assert len(swiftapi_saa_entries) == len(swift_saa_entries)
    assert (np.abs(swift_saa_entries - swiftapi_saa_entries) <= 60).all()
