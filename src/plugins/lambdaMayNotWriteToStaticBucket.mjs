/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// The Lambda function should not be able to modify the static bucket.
export const deploy = {
  start({ cloudformation }) {
    cloudformation.Resources.Role.Properties.Policies =
      cloudformation.Resources.Role.Properties.Policies.map((policy) => {
        if (policy.PolicyName == 'ArcStaticBucketPolicy')
          policy.PolicyDocument.Statement[0].Action = ['s3:GetObject']
        return policy
      })
    return cloudformation
  },
}
