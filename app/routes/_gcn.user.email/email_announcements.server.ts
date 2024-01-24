/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'

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
