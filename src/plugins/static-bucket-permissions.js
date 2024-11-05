/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// Functions may only write to the /generated directory in the static bucket.
export const deploy = {
  start({ cloudformation }) {
    const { Policies } = cloudformation.Resources.Role.Properties

    Policies.find(
      ({ PolicyName }) => PolicyName === 'ArcStaticBucketPolicy'
    ).PolicyDocument.Statement[0].Action = [
      's3:GetObject',
      's3:GetObjectAttributes',
      's3:ListBucket',
    ]

    Policies.push({
      PolicyName: 'ArcStaticBucketWriteGeneratedDirectoryPolicy',
      PolicyDocument: {
        Statement: [
          {
            Effect: 'Allow',
            Action: ['s3:PutObject', 's3:PutObjectAcl', 's3:DeleteObject'],
            Resource: [
              {
                'Fn::Sub': [
                  `arn:aws:s3:::\${bukkit}/generated/*`,
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
