/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import type { AttributeValue } from '@aws-sdk/client-dynamodb'
import { paginateQuery, paginateScan } from '@aws-sdk/lib-dynamodb'
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { errors } from '@opensearch-project/opensearch'
import type {
  DynamoDBRecord,
  AttributeValue as LambdaTriggerAttributeValue,
} from 'aws-lambda'

import { sendEmailBulk } from '~/lib/email.server'
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

async function getEmails() {
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument
  const TableName = db.name('circulars_subscriptions')
  const pages = paginateScan(
    { client },
    { AttributesToGet: ['email'], TableName }
  )
  const emails: string[] = []
  for await (const page of pages) {
    const newEmails = page.Items?.map(({ email }) => email)
    if (newEmails) emails.push(...newEmails)
  }
  return emails
}

async function getLegacyEmails() {
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument
  const TableName = db.name('legacy_users')
  const pages = paginateQuery(
    { client },
    {
      IndexName: 'legacyReceivers',
      KeyConditionExpression: 'receive = :receive',
      ExpressionAttributeValues: {
        ':receive': 1,
      },
      ProjectionExpression: 'email',
      TableName,
    }
  )
  const emails: string[] = []
  for await (const page of pages) {
    const newEmails = page.Items?.map(({ email }) => email)
    if (newEmails) emails.push(...newEmails)
  }
  return emails
}

async function send(circular: Circular) {
  const [emails, legacyEmails] = await Promise.all([
    getEmails(),
    getLegacyEmails(),
  ])
  const to = [...emails, ...legacyEmails]
  await sendEmailBulk({
    fromName,
    to,
    subject: circular.subject,
    body: formatCircular(circular),
    topic: 'circulars',
  })
}

// FIXME: must use module.exports here for OpenTelemetry shim to work correctly.
// See https://dev.to/heymarkkop/how-to-solve-cannot-redefine-property-handler-on-aws-lambda-3j67
module.exports.handler = createTriggerHandler(
  async ({ eventName, dynamodb }: DynamoDBRecord) => {
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
