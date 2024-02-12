# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.


import numpy as np


def test_burstcube_earthconstraint(burstcube_skyfield_windows, burstcube_windows):
    errors = np.ravel(abs(burstcube_windows - burstcube_skyfield_windows))
    # Check that visibility windows match to within 60 seconds
    assert max(errors) <= 60
    # Make sure < 5% of the start/stop times are off by +/-60 seconds
    assert len(np.where(errors != 0)) / len(errors) < 0.05
