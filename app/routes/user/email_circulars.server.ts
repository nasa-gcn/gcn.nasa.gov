import { tables } from '@architect/functions'

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
