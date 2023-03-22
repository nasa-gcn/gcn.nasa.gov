/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import {
  CreatePackageCommand,
  DeletePackageCommand,
  OpenSearchClient,
  UpdatePackageCommand,
} from '@aws-sdk/client-opensearch'
import { generate } from 'generate-password'

import { createCustomResourceHandler } from '../customResourceHandler'

const client = new OpenSearchClient({})

/**
 * Custom CloudFormation resource for OpenSearch packages.
 *
 * @todo: Remove once
 * https://github.com/aws-cloudformation/cloudformation-coverage-roadmap/issues/1570
 * has been fixed.
 */
// FIXME: must use module.exports here for OpenTelemetry shim to work correctly.
// See https://dev.to/heymarkkop/how-to-solve-cannot-redefine-property-handler-on-aws-lambda-3j67
module.exports.handler = createCustomResourceHandler({
  async Create({
    LogicalResourceId,
    ResourceProperties: { Bucket, Key },
    StackId,
  }) {
    const response = await client.send(
      new CreatePackageCommand({
        PackageName: `${LogicalResourceId.slice(
          0,
          17
        ).toLowerCase()}-${generate({
          length: 10,
          uppercase: false,
          numbers: true,
        })}`,
        PackageSource: { S3BucketName: Bucket, S3Key: Key },
        PackageType: 'TXT-DICTIONARY',
      })
    )
    const PhysicalResourceId = response.PackageDetails?.PackageID
    if (!PhysicalResourceId) throw new Error('PackageID unknown')
    return { PhysicalResourceId }
  },

  async Update({ ResourceProperties: { Bucket, Key }, PhysicalResourceId }) {
    await client.send(
      new UpdatePackageCommand({
        PackageID: PhysicalResourceId,
        PackageSource: { S3BucketName: Bucket, S3Key: Key },
      })
    )
    return { PhysicalResourceId }
  },

  async Delete({ PhysicalResourceId: PackageID }) {
    await client.send(new DeletePackageCommand({ PackageID }))
  },
})
