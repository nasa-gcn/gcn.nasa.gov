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
import { dedent } from 'ts-dedent'

import type { User } from '../_auth/user.server'
import { moderatorGroup } from '../circulars/circulars.server'
import { announcementAppendedText } from './email_announcements'
import { sendEmailBulk } from '~/lib/email.server'

export async function createAnnouncementSubsciption(
  sub: string,
  email: string
) {
  const created = Date.now()
  const db = await tables()
  await db.announcement_subscriptions.put({
    sub,
    email,
    created,
  })
}

export async function getAnnouncementSubscription(sub: string) {
  const db = await tables()
  const results = await db.announcement_subscriptions.query({
    IndexName: 'announcementSubscriptionsBySub',
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

export async function deleteAnnouncementSubscription(
  sub: string,
  email: string
) {
  const db = await tables()
  await db.announcement_subscriptions.delete({
    sub,
    email,
  })
}

export async function sendAnnouncementEmail(
  subject: string,
  body: string,
  user?: User
) {
  if (!user?.groups.includes(moderatorGroup))
    throw new Response(null, { status: 403 })

  const [emails, legacyEmails] = await Promise.all([
    getAnnouncementReceiverEmails(),
    getLegacyAnnouncementReceiverEmails(),
  ])

  const formattedBody = dedent`
  ${body}

  
  ${announcementAppendedText}
  `

  await sendEmailBulk({
    fromName: 'GCN Announcements',
    to: [...emails, ...legacyEmails],
    subject,
    body: formattedBody,
    topic: 'announcements',
  })
}

async function getAnnouncementReceiverEmails() {
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument
  const TableName = db.name('announcement_subscriptions')

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

async function getLegacyAnnouncementReceiverEmails() {
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument
  const TableName = db.name('legacy_users')
  const pages = paginateQuery(
    { client },
    {
      IndexName: 'legacyAnnouncementReceivers',
      KeyConditionExpression: 'receiveAnnouncements = :receiveAnnouncements',
      ExpressionAttributeValues: {
        ':receiveAnnouncements': 1,
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
