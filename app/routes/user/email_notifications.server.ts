/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { tables } from '@architect/functions'
import { SendEmailCommand, SESv2Client } from '@aws-sdk/client-sesv2'
import { topicToFormatAndNoticeType } from '~/lib/utils'
import { getUser } from '~/routes/__auth/user.server'
import crypto from 'crypto'

// db model
export type EmailNotification = {
  name: string
  recipient: string
  created: number
  active: boolean
  uuid?: string
  topics: string[]
}

// view model
export interface EmailNotificationVM extends EmailNotification {
  format: string
  noticeTypes: string[]
}

export class EmailNotificationVendingMachine {
  #sub: string
  #domain: string

  private constructor(sub: string, domain: string) {
    this.#sub = sub
    this.#domain = domain
  }

  // Init machine
  static async create(request: Request) {
    const user = await getUser(request)
    let domain = new URL(request.url).hostname
    // If we are in local development, assume test.gcn.nasa.gov
    if (!domain.endsWith('gcn.nasa.gov')) {
      domain = 'test.gcn.nasa.gov'
    }

    if (!user) throw new Response('not signed in', { status: 403 })
    return new this(user.sub, domain)
  }

  // Create
  async createEmailNotification(notification: EmailNotification) {
    if (!notification.name)
      throw new Response('name must not be empty', { status: 400 })
    if (!notification.recipient)
      throw new Response('recipient must not be empty', { status: 400 })
    if (!notification.topics)
      throw new Response('topics must not be empty', { status: 400 })

    const created = Date.now()
    const uuid = crypto.randomUUID()

    const db = await tables()
    const main = db.email_notification.put({
      sub: this.#sub,
      uuid,
      name: notification.name,
      created,
      topics: notification.topics,
      active: true,
      recipient: notification.recipient,
    })
    const subscriptionPromises = notification.topics.map((topic) =>
      db.email_notification_subscription.put({
        uuid,
        topic,
        recipient: notification.recipient,
      })
    )

    await Promise.all([main, ...subscriptionPromises])
  }

  // Read
  async getEmailNotifications() {
    const db = await tables()
    const results = await db.email_notification.query({
      KeyConditionExpression: '#sub = :sub',
      ExpressionAttributeNames: {
        '#sub': 'sub',
        '#uuid': 'uuid',
        '#name': 'name',
        '#created': 'created',
        '#topics': 'topics',
        '#recipient': 'recipient',
        '#active': 'active',
      },
      ExpressionAttributeValues: {
        ':sub': this.#sub,
      },
      ProjectionExpression:
        '#uuid, #created, #name, #topics, #recipient, #active',
    })
    const items = results.Items as EmailNotification[]
    const emailNotifications: EmailNotificationVM[] = items.map(
      (notification) => ({
        format: topicToFormatAndNoticeType(notification.topics[0]).noticeFormat,
        noticeTypes: notification.topics.map(
          (topic) => topicToFormatAndNoticeType(topic).noticeType
        ),
        name: notification.name,
        recipient: notification.recipient,
        created: notification.created,
        active: notification.active,
        topics: notification.topics,
        uuid: notification.uuid,
      })
    )

    emailNotifications.sort((a, b) => a.created - b.created)
    return emailNotifications
  }

  async getEmailNotification(uuid: string): Promise<EmailNotificationVM> {
    const db = await tables()
    const item = (await db.email_notification.get({
      sub: this.#sub,
      uuid,
    })) as ({ sub: string } & EmailNotificationVM) | null
    if (!item) throw new Response(null, { status: 404 })
    item.noticeTypes = item.topics.map(
      (topic) => topicToFormatAndNoticeType(topic).noticeType
    )
    item.format = topicToFormatAndNoticeType(item.topics[0]).noticeFormat
    const { sub, ...notification } = item
    return {
      uuid,
      ...notification,
    }
  }

  // Update
  async updateEmailNotification(email_notification: EmailNotification) {
    if (!email_notification.uuid) return null
    const db = await tables()
    await db.email_notification.update({
      Key: { sub: this.#sub, uuid: email_notification.uuid },
      UpdateExpression:
        'set #name = :name, #recipient = :recipient, #topics = :topics, #active = :active ',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#topics': 'topics',
        '#recipient': 'recipient',
        '#active': 'active',
      },
      ExpressionAttributeValues: {
        ':name': email_notification.name,
        ':recipient': email_notification.recipient,
        ':topics': email_notification.topics,
        ':active': email_notification.active,
      },
    })

    // Update Materialized View
    const subscriptions = await db.email_notification_subscription.query({
      KeyConditionExpression: '#uuid = :uuid',
      ExpressionAttributeNames: {
        '#uuid': 'uuid',
      },
      ExpressionAttributeValues: {
        ':uuid': email_notification.uuid,
      },
    })
    await Promise.all(
      subscriptions.Items.map((sub) => {
        return db.email_notification_subscription.delete({
          uuid: sub.uuid,
          topic: sub.topic,
        })
      })
    )
    if (email_notification.active) {
      await Promise.all(
        email_notification.topics.map((topic) =>
          db.email_notification_subscription.put({
            uuid: email_notification.uuid,
            topic,
            recipient: email_notification.recipient,
          })
        )
      )
    }
  }

  // Delete
  async deleteEmailNotification(uuid: string) {
    const db = await tables()
    const item = await db.email_notification.get({
      sub: this.#sub,
      uuid,
    })
    if (!item) throw new Response(null, { status: 404 })
    await db.email_notification.delete({ sub: this.#sub, uuid })
    const subscriptions = await db.email_notification_subscription.query({
      KeyConditionExpression: '#uuid = :uuid',
      ExpressionAttributeNames: {
        '#uuid': 'uuid',
      },
      ExpressionAttributeValues: {
        ':uuid': uuid,
      },
    })
    await Promise.all(
      subscriptions.Items.map((sub) =>
        db.email_notification_subscription.delete({
          uuid: sub.uuid,
          topic: sub.topic,
        })
      )
    )
  }

  // Send Test Email
  async sendTestEmail(destination: string) {
    var domain = ''
    if (process.env.NODE_ENV === 'production') {
      domain = 'gcn.nasa.gov'
    } else if (process.env.NODE_ENV === 'test') {
      domain = 'test.gcn.nasa.gov'
    } else {
      domain = 'dev.gcn.nasa.gov'
    }

    const client = new SESv2Client({})

    const command = new SendEmailCommand({
      FromEmailAddress: `no-reply@${domain}`,
      Destination: {
        ToAddresses: [destination],
      },
      Content: {
        Simple: {
          Subject: { Data: 'Test Alert for GCN Notice Subscription' },
          Body: {
            Text: {
              Data: 'This is a test message from the GCN notice system.',
            },
          },
        },
      },
    })

    await client.send(command)
  }
}
