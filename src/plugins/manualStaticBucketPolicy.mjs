/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

// Mission Cloud Platform does not support user-defined bucket policies;
// they must be set manually by an administrator
export const deploy = {
  start({ cloudformation }) {
    delete cloudformation.Resources.StaticBucketPolicy
    return cloudformation
  },
}
