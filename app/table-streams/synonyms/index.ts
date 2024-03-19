/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { AttributeValue } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { search as getSearchClient } from '@nasa-gcn/architect-functions-search'
import { errors } from '@opensearch-project/opensearch'
import type {
  DynamoDBRecord,
  AttributeValue as LambdaTriggerAttributeValue,
} from 'aws-lambda'

import { createTriggerHandler } from '~/lib/lambdaTrigger.server'
import type { Synonym } from '~/routes/synonyms/synonyms.lib'

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

export const handler = createTriggerHandler(
  async ({ eventName, dynamodb }: DynamoDBRecord) => {
    const id = unmarshallTrigger(dynamodb!.Keys).id as string
    const promises = []

    if (eventName === 'REMOVE') {
      promises.push(removeIndex(id))
    } /* (eventName === 'INSERT' || eventName === 'MODIFY') */ else {
      const synonym = unmarshallTrigger(dynamodb!.NewImage) as Synonym
      promises.push(putIndex(synonym))
    }

    await Promise.all(promises)
  }
)
