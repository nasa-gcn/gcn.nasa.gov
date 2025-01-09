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
    await Promise.all(
      [dynamodb.OldImage, dynamodb.NewImage]
        .filter((image) => image !== undefined)
        .map(async (image) => {
          const { synonymId } = unmarshallTrigger(image) as Synonym
          const synonyms = await getSynonymsByUuid(synonymId)
          if (synonyms.length > 0) {
            await putIndex({
              synonymId,
              eventIds: synonyms.map((synonym) => synonym.eventId),
              slugs: synonyms.map((synonym) => synonym.slug),
            })
          } else {
            await removeIndex(synonymId)
          }
        })
    )
  }
)
