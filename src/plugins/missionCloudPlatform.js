/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// Custom permissions for deployment on Mission Cloud Platform
export const deploy = {
  start({ cloudformation }) {
    // Mission Cloud Platform does not support user-defined public access block
    // configurations; they must be set manually by an administrator
    delete cloudformation.Resources.StaticBucket.Properties
      .PublicAccessBlockConfiguration

    // Add required permissions boundary for working on the Mission Cloud Platform
    cloudformation.Resources.Role.Properties.PermissionsBoundary = {
      'Fn::Sub': `arn:\${AWS::Partition}:iam::\${AWS::AccountId}:policy/mcp-tenantOperator`,
    }
    return cloudformation
  },
}
