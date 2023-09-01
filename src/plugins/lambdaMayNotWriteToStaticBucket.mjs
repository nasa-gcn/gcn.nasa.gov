/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// The Lambda function should not be able to modify the deployment folder in the static bucket.
export const deploy = {
  start({ cloudformation }) {
    cloudformation.Resources.Role.Properties.Policies.push({
      PolicyName: 'ArcStaticBucketDenyWriteAppDirectoryPolicy',
      PolicyDocument: {
        Statement: [
          {
            Effect: 'Deny',
            Action: ['s3:PutObject', 's3:PutObjectAcl', 's3:DeleteObject'],
            Resource: [
              {
                'Fn::Sub': [
                  `arn:aws:s3:::\${bukkit}/app/*`,
                  {
                    bukkit: {
                      Ref: 'StaticBucket',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    })
    return cloudformation
  },
}
