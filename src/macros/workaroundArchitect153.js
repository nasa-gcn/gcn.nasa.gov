/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

// Work around https://github.com/architect/package/pull/153
module.exports = function workaroundArchitect153(arc, sam) {
  sam.Resources.Role.Properties.Policies.find =
    sam.Resources.Role.Properties.Policies.map((policy) => {
      if (policy.PolicyName == 'ArcDynamoPolicy') {
        policy.PolicyDocument.Statement = policy.PolicyDocument.Statement.map(
          (statement) => {
            if (statement.Action == 'dynamodb:DeleteTable') {
              statement.Resource = { 'Fn::Sub': statement.Resource }
            }
            return statement
          }
        )
      }
      return policy
    })
  return sam
}
