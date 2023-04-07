/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { tables } from '@architect/functions'
import type { AttributeValue } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { ResponseError } from '@opensearch-project/opensearch/lib/errors'
import type {
  DynamoDBRecord,
  AttributeValue as LambdaTriggerAttributeValue,
} from 'aws-lambda'

import { sendEmailBulk } from '~/lib/email.server'
import { feature } from '~/lib/env.server'
import { createTriggerHandler } from '~/lib/lambdaTrigger.server'
import { search as getSearchClient } from '~/lib/search.server'
import type { Circular } from '~/routes/circulars/circulars.lib'
import { formatCircular } from '~/routes/circulars/circulars.lib'

const index = 'circulars'
const fromName = 'GCN Circulars'

function unmarshallTrigger(item?: Record<string, LambdaTriggerAttributeValue>) {
  return unmarshall(item as Record<string, AttributeValue>)
}

async function removeIndex(id: number) {
  const client = await getSearchClient()
  try {
    await client.delete({ index, id: id.toString() })
  } catch (e) {
    if (!(e instanceof ResponseError && e.body.result === 'not_found')) {
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

async function send(circular: Circular) {
  const db = await tables()
  const { Items } = await db.circulars_subscriptions.scan({
    AttributesToGet: ['email'],
  })
  const { Items: LegacyItems } = await db.legacy_users.query({
    IndexName: 'legacyReceivers',
    KeyConditionExpression: 'receive = :receive',
    ExpressionAttributeValues: {
      ':receive': 1,
    },
    ProjectionExpression: 'email',
  })

  const recipients = [...Items, ...LegacyItems].map(({ email }) => email)
  await sendEmailBulk({
    fromName,
    recipients,
    subject: circular.subject,
    body: formatCircular(circular),
  })
}

// FIXME: must use module.exports here for OpenTelemetry shim to work correctly.
// See https://dev.to/heymarkkop/how-to-solve-cannot-redefine-property-handler-on-aws-lambda-3j67
module.exports.handler = createTriggerHandler(
  async ({ eventName, dynamodb }: DynamoDBRecord) => {
    if (!feature('circulars')) throw new Error('not implemented')
    const id = unmarshallTrigger(dynamodb!.Keys).circularId as number
    const promises = []

    if (eventName === 'REMOVE') {
      promises.push(removeIndex(id))
    } /* (eventName === 'INSERT' || eventName === 'MODIFY') */ else {
      const circular = unmarshallTrigger(dynamodb!.NewImage) as Circular
      promises.push(putIndex(circular))
      if (eventName === 'INSERT') promises.push(send(circular))
    }

    await Promise.all(promises)
  }
)
