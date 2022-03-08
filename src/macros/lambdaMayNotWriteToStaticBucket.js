/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

// The Lambda function should not be able to modify the static bucket.
module.exports = function lambdaMayNotWriteToStaticBucket(arc, sam) {
  sam.Resources.Role.Properties.Policies =
    sam.Resources.Role.Properties.Policies.map((policy) => {
      if (policy.PolicyName == 'ArcStaticBucketPolicy')
        policy.PolicyDocument.Statement[0].Action = ['s3:GetObject']
      return policy
    })
  return sam
}
