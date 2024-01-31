/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import { paginateQuery } from '@aws-sdk/lib-dynamodb'
import { type DynamoDBDocument } from '@aws-sdk/lib-dynamodb'

async function nukeSubscriptions(
  email: string,
  emailKey: string,
  keys: string[],
  tableName: string,
  indexName?: string
) {
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument
  const TableName = db.name(tableName)

  const pages = paginateQuery(
    { client, pageSize: 25 },
    {
      ExpressionAttributeNames: {
        '#email': emailKey,
        ...Object.fromEntries(keys.map((key, i) => [`#proj${i}`, key])),
      },
      ExpressionAttributeValues: { ':email': email },
      IndexName: indexName,
      KeyConditionExpression: '#email = :email',
      ProjectionExpression: keys.map((_, i) => `#proj${i}`).join(', '),
      TableName,
    }
  )

  const promises = []
  for await (const { Items } of pages) {
    if (Items?.length) {
      promises.push(
        client.batchWrite({
          RequestItems: {
            [TableName]: Items.map((Key) => ({
              DeleteRequest: { Key },
            })),
          },
        })
      )
    }
  }

  await Promise.all(promises)
}

export const unsubscribeActions = {
  async circulars(email: string) {
    await Promise.all([
      nukeSubscriptions(
        email,
        'email',
        ['email', 'sub'],
        'circulars_subscriptions'
      ),
      (async () => {
        const db = await tables()
        const item = await db.legacy_users.get({ email })
        if (item)
          await db.legacy_users.update({
            Key: { email },
            UpdateExpression: 'set receive = :receive',
            ExpressionAttributeValues: { ':receive': 0 },
          })
      })(),
    ])
  },
  async notices(email: string) {
    await Promise.all([
      nukeSubscriptions(
        email,
        'recipient',
        ['sub', 'uuid'],
        'email_notification',
        'byRecipient'
      ),
      nukeSubscriptions(
        email,
        'recipient',
        ['uuid', 'topic'],
        'email_notification_subscription',
        'byRecipient'
      ),
    ])
  },
  async announcements(email: string) {
    await Promise.all([
      nukeSubscriptions(
        email,
        'email',
        ['email', 'sub'],
        'announcement_subscriptions'
      ),
      (async () => {
        const db = await tables()
        const item = await db.legacy_users.get({ email })
        if (item)
          await db.legacy_users.update({
            Key: { email },
            UpdateExpression:
              'set receiveAnnouncements = :receiveAnnouncements',
            ExpressionAttributeValues: { ':receiveAnnouncements': 0 },
          })
      })(),
    ])
  },
}
