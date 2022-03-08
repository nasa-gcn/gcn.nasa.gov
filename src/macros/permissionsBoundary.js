/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

// Add required permissions boundary for working on the Mission Cloud Platform
module.exports = function permissionsBoundary(arc, sam) {
  sam.Resources.Role.Properties.PermissionsBoundary = {
    'Fn::Sub': 'arn:aws:iam::${AWS::AccountId}:policy/mcp-tenantOperator',
  }
  return sam
}
