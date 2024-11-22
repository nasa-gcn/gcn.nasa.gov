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
    if (!eventName || !dynamodb) return
    const { synonymId } = unmarshallTrigger(dynamodb!.NewImage) as Synonym
    const dynamoSynonyms = await getSynonymsByUuid(synonymId)
    if (dynamoSynonyms.length > 0) {
      await putIndex({
        synonymId,
        eventIds: dynamoSynonyms.map((synonym) => synonym.eventId),
      })
    } else {
      await removeIndex(synonymId)
    }
  }
)
