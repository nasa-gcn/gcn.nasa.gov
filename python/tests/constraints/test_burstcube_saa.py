# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.


def test_burstcube_saa(burstcube_skyfield_saa, burstcube_saa_windows):
    assert (
        (burstcube_saa_windows - burstcube_skyfield_saa) == 0
    ).all(), "SAA calculated windows don't match"
