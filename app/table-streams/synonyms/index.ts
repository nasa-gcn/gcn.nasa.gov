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
import 'source-map-support/register'

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

    const { synonymId, eventId } = unmarshallTrigger(
      dynamodb!.NewImage
    ) as Synonym
    let previousSynonymId = null
    if (dynamodb!.OldImage) {
      const { synonymId: oldSynonymId } = unmarshallTrigger(
        dynamodb!.OldImage
      ) as Synonym
      previousSynonymId = oldSynonymId
    }

    const dynamoSynonyms = await getSynonymsByUuid(synonymId)
    const dynamoPreviousGroup = previousSynonymId
      ? (await getSynonymsByUuid(previousSynonymId)).filter(
          (synonym) => synonym.eventId != eventId
        )
      : []

    if (previousSynonymId && dynamoPreviousGroup.length === 0) {
      await removeIndex(previousSynonymId)
    } else if (previousSynonymId && dynamoPreviousGroup.length > 0) {
      await putIndex({
        synonymId: previousSynonymId,
        eventIds: dynamoPreviousGroup.map((synonym) => synonym.eventId),
        slugs: dynamoPreviousGroup.map((synonym) => synonym.slug),
      })
    }

    if (dynamoSynonyms.length > 0) {
      await putIndex({
        synonymId,
        eventIds: dynamoSynonyms.map((synonym) => synonym.eventId),
        slugs: dynamoSynonyms.map((synonym) => synonym.slug),
      })
    } else {
      await removeIndex(synonymId)
    }
  }
)
