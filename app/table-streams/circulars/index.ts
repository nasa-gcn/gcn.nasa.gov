/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { search as getSearchClient } from '@nasa-gcn/architect-functions-search'
import { errors } from '@opensearch-project/opensearch'
import type { DynamoDBRecord } from 'aws-lambda'

import { unmarshallTrigger } from '../utils'
import { send as sendKafka } from '~/lib/kafka.server'
import { createTriggerHandler } from '~/lib/lambdaTrigger.server'
import type { Circular } from '~/routes/circulars/circulars.lib'
import { send } from '~/routes/circulars/circulars.server'

import { $id as circularsJsonSchemaId } from '@nasa-gcn/schema/gcn/circulars.schema.json'

const index = 'circulars'

async function removeIndex(id: number) {
  const client = await getSearchClient()
  try {
    await client.delete({ index, id: id.toString() })
  } catch (e) {
    if (!(e instanceof errors.ResponseError && e.body.result === 'not_found')) {
      throw e
    }
  }
}

async function putIndex(circular: Circular) {
  const client = await getSearchClient()
  await client.index({
    index,
    id: circular.circularId.toString(),
    body: circular,
  })
}

// Export handler entrypoint for instrumentation with OpenTelemetry.
// From https://aws-otel.github.io/docs/getting-started/lambda/lambda-js#requirements:
//
// > For TypeScript users, if you are using esbuild (either directly or through
// > tools such as the AWS CDK), you must export your handler function through
// > module.exports rather than with the export keyword! The AWS mananaged layer
// > for ADOT JavaScript needs to hot-patch your handler at runtime, but can't
// > because esbuild makes your handler immutable when using the export keyword.
module.exports.handler = createTriggerHandler(
  async ({ eventName, dynamodb }: DynamoDBRecord) => {
    const id = unmarshallTrigger(dynamodb!.Keys).circularId as number
    const promises = []

    if (eventName === 'REMOVE') {
      promises.push(removeIndex(id))
    } /* (eventName === 'INSERT' || eventName === 'MODIFY') */ else {
      const circular = unmarshallTrigger(dynamodb!.NewImage) as Circular
      const { sub, ...cleanedCircular } = circular
      promises.push(
        putIndex(circular),
        sendKafka(
          'gcn.circulars',
          JSON.stringify({
            $schema: circularsJsonSchemaId,
            ...cleanedCircular,
          })
        )
      )
      if (eventName === 'INSERT') {
        promises.push(send(circular))
      }
    }

    await Promise.all(promises)
  }
)
