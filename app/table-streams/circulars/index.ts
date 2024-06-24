/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import type { AttributeValue } from '@aws-sdk/client-dynamodb'
import { paginateQuery, paginateScan } from '@aws-sdk/lib-dynamodb'
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { search as getSearchClient } from '@nasa-gcn/architect-functions-search'
import { errors } from '@opensearch-project/opensearch'
import type {
  DynamoDBRecord,
  AttributeValue as LambdaTriggerAttributeValue,
} from 'aws-lambda'

import { sendEmailBulk } from '~/lib/email.server'
import { origin } from '~/lib/env.server'
import { send as sendKafka } from '~/lib/kafka.server'
import { createTriggerHandler } from '~/lib/lambdaTrigger.server'
import type { Circular } from '~/routes/circulars/circulars.lib'
import { formatCircularText } from '~/routes/circulars/circulars.lib'

import { $id as circularsJsonSchemaId } from '@nasa-gcn/schema/gcn/circulars.schema.json'

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
    body: `${formatCircularText(
      circular
    )}\n\n\nView this GCN Circular online at ${origin}/circulars/${
      circular.circularId
    }.`,
    topic: 'circulars',
  })
}

export const handler = createTriggerHandler(
  async ({ eventName, dynamodb }: DynamoDBRecord) => {
    const id = unmarshallTrigger(dynamodb!.Keys).circularId as number
    const promises = []

    if (eventName === 'REMOVE') {
      promises.push(removeIndex(id))
    } /* (eventName === 'INSERT' || eventName === 'MODIFY') */ else {
      const circular = unmarshallTrigger(dynamodb!.NewImage) as Circular
      promises.push(putIndex(circular))
      if (eventName === 'INSERT') {
        promises.push(send(circular))
        const { sub, ...cleanedCircular } = circular
        promises.push(
          sendKafka(
            'gcn.circulars',
            JSON.stringify({
              $schema: circularsJsonSchemaId,
              ...cleanedCircular,
            })
          )
        )
      }
    }

    await Promise.all(promises)
  }
)
