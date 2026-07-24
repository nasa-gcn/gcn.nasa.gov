/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { paginateQuery, paginateScan } from '@aws-sdk/lib-dynamodb'

import { type Circular, formatCircularText } from '../circulars/circulars.lib'
import { type EmailSubscription, sendEmailBulk } from '~/lib/email.server'
import { origin } from '~/lib/env.server'
import { truncateJsonMaxBytes } from '~/lib/utils'

export type CircularsEventTypeSubscriptions = EmailSubscription & {
  eventTypes: EventTypePreference[]
}

type EventTypePreference = {
  uuid: string // Id linking to the EmailSubscription's UUID
  eventType: string
  ignore: boolean
}
const fromName = 'GCN Circulars'

export async function createCircularEmailNotification(
  sub: string,
  email: string
) {
  const created = Date.now()
  const db = await tables()
  await db.circulars_subscriptions.put({
    sub,
    email,
    created,
  })
}

export async function getUsersCircularSubmissionStatus(sub: string) {
  const db = await tables()
  const results = await db.circulars_subscriptions.query({
    IndexName: 'circularsSubscriptionsBySub',
    KeyConditionExpression: '#sub = :sub',
    ExpressionAttributeNames: {
      '#sub': 'sub',
      '#created': 'created',
      '#email': 'email',
    },
    ExpressionAttributeValues: {
      ':sub': sub,
    },
    ProjectionExpression: '#created, #email',
  })
  return results.Items.length > 0
}

export async function getCircularEmailNotification(sub: string) {
  const db = await tables()
  const results = await db.circulars_subscriptions.query({
    IndexName: 'circularsSubscriptionsBySub',
    KeyConditionExpression: '#sub = :sub',
    ExpressionAttributeNames: {
      '#sub': 'sub',
      '#uuid': 'uuid',
      '#created': 'created',
      '#recipient': 'recipient',
    },
    ExpressionAttributeValues: {
      ':sub': sub,
    },
    ProjectionExpression: '#uuid, #created, #name, #recipient',
  })
  return results.Items.length ? results.Items[0] : []
}

export async function deleteCircularEmailNotification(
  sub: string,
  email: string
) {
  const db = await tables()
  await db.circulars_subscriptions.delete({
    sub,
    email,
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

export async function send(circular: Circular) {
  const [emails, legacyEmails] = await Promise.all([
    getEmails(),
    getLegacyEmails(),
  ])
  const to = [...emails, ...legacyEmails]

  await sendBulkCircularsTo(circular, to)
}

async function sendBulkCircularsTo(circular: Circular, to: string[]) {
  const { text, truncated } = truncateJsonMaxBytes(
    formatCircularText(circular),
    200_000
  )

  await sendEmailBulk({
    fromName,
    to,
    subject: circular.subject,
    body: `${text}${truncated ? '...\n\n\nThis message was truncated. View the full' : '\n\n\nView this'} GCN Circular online at ${origin}/circulars/${
      circular.circularId
    }.`,
    topic: 'circulars',
  })
}

export async function sendEventTypedEmails(circular: Circular) {
  if (!circular.eventType) throw new Response(null, { status: 500 })
  const to = await getEmailsForEventTypes(circular.eventType)
  await sendBulkCircularsTo(circular, to)
}

export async function createEventBasedCircularEmailSubscription(
  item: CircularsEventTypeSubscriptions
) {
  const created = Date.now()
  const uuid = crypto.randomUUID()

  const db = await tables()
  const main = db.circular_eventType_email.put({
    sub: item.sub,
    uuid,
    name: item.name,
    created,
    eventNames: item.eventTypes,
    recipient: item.recipient,
  })
  const subscriptionPromises = item.eventTypes.map((prefernce) =>
    db.circular_eventType_email_subscriptions.put({
      uuid,
      eventType: prefernce.eventType,
      recipient: item.recipient,
      ignore: prefernce.ignore,
    })
  )

  await Promise.all([main, ...subscriptionPromises])
}

/**
 * Given a list of eventType strings from a circular, retrieve addresses from users
 * who have created notification sets that include this event type. If the type is
 * included, but marked as ignored, that set will not be included.
 * @param eventType
 * @returns
 */
export async function getEmailsForEventTypes(
  eventTypes: string[]
): Promise<string[]> {
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument
  const TableName = db.name('circular_eventType_email_subscriptions')
  const pages = paginateScan(
    { client },
    {
      TableName,
      ProjectionExpression: '#uuid, recipient, eventType, #ignore',
      ExpressionAttributeNames: {
        '#uuid': 'uuid',
        '#ignore': 'ignore',
      },
    }
  )

  const preferences: (EventTypePreference & { recipient: string })[] = []
  const ignoredUuids = new Set<string>()

  for await (const page of pages) {
    if (page.Items) {
      const items = page.Items as (EventTypePreference & {
        recipient: string
      })[]
      for (const item of items) {
        preferences.push(item)
        if (item.ignore && eventTypes.includes(item.eventType)) {
          ignoredUuids.add(item.uuid)
        }
      }
    }
  }

  return preferences
    .filter((item) => !ignoredUuids.has(item.uuid))
    .map((item) => item.recipient)
}
