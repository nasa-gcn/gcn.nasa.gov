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
    // Mission Cloud Platform requires that S3 buckets only permit access over
    // SSL in order to dismiss
    // https://docs.aws.amazon.com/securityhub/latest/userguide/s3-controls.html#s3-5.
    cloudformation.Resources.StaticBucketPolicy.Properties.PolicyDocument.Statement.push(
      {
        Sid: 'AllowSSLRequestsOnly',
        Action: 's3:*',
        Effect: 'Deny',
        Resource: [
          { 'Fn::GetAtt': 'StaticBucket.Arn' },
          {
            'Fn::Sub': [
              `\${bukkit}/*`,
              { bukkit: { 'Fn::GetAtt': 'StaticBucket.Arn' } },
            ],
          },
        ],
        Condition: {
          Bool: { 'aws:SecureTransport': false },
        },
        Principal: '*',
      }
    )

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
