/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

// OpenSearch synonyms file
export const deploy = {
  start({ cloudformation }) {
    Object.assign(cloudformation.Resources, {
      OpenSearchCustomPackagePolicy: {
        Type: 'AWS::IAM::Policy',
        Properties: {
          PolicyName: 'OpenSearchCustomPackagePolicy',
          PolicyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Action: [
                  'es:AssociatePackage',
                  'es:CreatePackage',
                  'es:DeletePackage',
                  'es:DescribePackages',
                  'es:DissociatePackage',
                  'es:ListPackagesForDomain',
                ],
                Resource: '*',
              },
            ],
          },
          Roles: [{ Ref: 'Role' }],
        },
      },
      OpenSearchSynonymsFile: {
        Type: 'Custom::S3CreateFile',
        Properties: {
          Bucket: { Ref: 'SearchBucket' },
          Key: 'synonyms.txt',
          ServiceToken: {
            'Fn::GetAtt': ['S3CreateFileCustomLambda', 'Arn'],
          },
        },
      },
      OpenSearchSynonymsPackage: {
        Type: 'Custom::OpenSearchPackage',
        DependsOn: ['OpenSearchSynonymsFile'],
        Properties: {
          Bucket: {
            Ref: 'SearchBucket',
          },
          Key: 'synonyms.txt',
          ServiceToken: {
            'Fn::GetAtt': ['OpensearchPackageCustomLambda', 'Arn'],
          },
        },
      },
    })
    return cloudformation
  },
  services({ stage }) {
    if (stage !== 'production') {
      return { PackageID: { Ref: 'OpenSearchSynonymsPackage' } }
    }
  },
}

export const set = {
  customLambdas() {
    return ['opensearch-package', 's3-create-file'].map((name) => ({
      name,
      src: `build/cfn-resources/${name}`,
    }))
  },
}
