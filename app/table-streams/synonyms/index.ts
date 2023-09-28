/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { AttributeValue } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { errors } from '@opensearch-project/opensearch'
import type {
  DynamoDBRecord,
  AttributeValue as LambdaTriggerAttributeValue,
} from 'aws-lambda'

import { createTriggerHandler } from '~/lib/lambdaTrigger.server'
import { search as getSearchClient } from '~/lib/search.server'
import type { Synonym } from '~/routes/circulars/circulars.lib'

const index = 'synonyms'

function unmarshallTrigger(item?: Record<string, LambdaTriggerAttributeValue>) {
  return unmarshall(item as Record<string, AttributeValue>)
}

async function removeIndex(id: string) {
  const client = await getSearchClient()
  try {
    await client.delete({ index, id })
  } catch (e) {
    if (!(e instanceof errors.ResponseError && e.body.result === 'not_found')) {
      throw e
    }
  }
}

async function putIndex(synonym: Synonym) {
  const client = await getSearchClient()
  await client.index({
    index,
    body: synonym,
  })
}

// FIXME: must use module.exports here for OpenTelemetry shim to work correctly.
// See https://dev.to/heymarkkop/how-to-solve-cannot-redefine-property-handler-on-aws-lambda-3j67
module.exports.handler = createTriggerHandler(
  async ({ eventName, dynamodb }: DynamoDBRecord) => {
    const id = unmarshallTrigger(dynamodb!.Keys).id as string
    const promises = []

    if (eventName === 'REMOVE') {
      promises.push(removeIndex(id))
    } /* (eventName === 'INSERT' || eventName === 'MODIFY') */ else {
      console.log('IN THE STREAM')
      const synonym = unmarshallTrigger(dynamodb!.NewImage) as Synonym
      promises.push(putIndex(synonym))
    }

    await Promise.all(promises)
  }
)
