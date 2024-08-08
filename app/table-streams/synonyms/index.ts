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
import { createTriggerHandler } from '~/lib/lambdaTrigger.server'
import type { Synonym, SynonymGroup } from '~/routes/synonyms/synonyms.lib'
import { getSynonymsByUuid } from '~/routes/synonyms/synonyms.server'

const index = 'synonym-groups'

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

async function putIndex(synonymGroup: SynonymGroup) {
  const client = await getSearchClient()
  await client.index({
    index,
    id: synonymGroup.synonymId,
    body: synonymGroup,
  })
}

export const handler = createTriggerHandler(
  async ({ eventName, dynamodb }: DynamoDBRecord) => {
    if (!eventName || !dynamodb) return
    const promises = []
    const id = unmarshallTrigger(dynamodb!.Keys).synonymId
    const synonym = unmarshallTrigger(dynamodb!.NewImage) as Synonym
    const dynamoSynonyms = await getSynonymsByUuid(synonym.synonymId)
    const group = {
      synonymId: synonym.synonymId,
      eventIds: dynamoSynonyms.map((synonym) => synonym.eventId),
    }
    if (eventName === 'REMOVE' && group.eventIds.length === 0) {
      promises.push(removeIndex(id))
    } /* (eventName === 'INSERT' || eventName === 'MODIFY') */ else {
      promises.push(putIndex(group))
    }
    await Promise.all(promises)
  }
)
