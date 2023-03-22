/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import {
  DeleteObjectCommand,
  GetObjectCommand,
  NoSuchKey,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import type { CloudFormationCustomResourceCreateEvent } from 'aws-lambda'
import pick from 'lodash/pick'

import { createCustomResourceHandler } from '../customResourceHandler'

const client = new S3Client({})

async function CreateUpdate({
  ResourceProperties,
}: Pick<CloudFormationCustomResourceCreateEvent, 'ResourceProperties'>) {
  const props = pick(ResourceProperties, ['Bucket', 'Key'])
  try {
    await client.send(new GetObjectCommand(props))
  } catch (e) {
    if (e instanceof NoSuchKey) {
      await client.send(new PutObjectCommand(props))
    } else {
      throw e
    }
  }
  return { PhysicalResourceId: `s3://${props.Bucket}/${props.Key}` }
}

/**
 * Custom CloudFormation resource to create an empty object in an S3 bucket.
 */
// FIXME: must use module.exports here for OpenTelemetry shim to work correctly.
// See https://dev.to/heymarkkop/how-to-solve-cannot-redefine-property-handler-on-aws-lambda-3j67
module.exports.handler = createCustomResourceHandler({
  Create: CreateUpdate,
  Update: CreateUpdate,
  async Delete({ ResourceProperties }) {
    const props = pick(ResourceProperties, ['Bucket', 'Key'])
    await client.send(new DeleteObjectCommand(props))
  },
})
