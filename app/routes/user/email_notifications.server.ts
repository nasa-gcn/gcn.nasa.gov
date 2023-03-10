/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { tables } from '@architect/functions'
import crypto from 'crypto'
import { validate } from 'email-validator'

import { sendEmail } from '~/lib/email.server'
import { topicToFormatAndNoticeType } from '~/lib/utils'
import { getUser } from '~/routes/__auth/user.server'

// db model
export type EmailNotification = {
  name: string
  recipient: string
  created: number
  uuid?: string
  topics: string[]
}

// view model
export interface EmailNotificationVM extends EmailNotification {
  format: string
  noticeTypes: string[]
}

export class EmailNotificationServer {
  #sub: string

  private constructor(sub: string) {
    this.#sub = sub
  }

  // Init machine
  static async create(request: Request) {
    const user = await getUser(request)
    if (!user) throw new Response('not signed in', { status: 403 })
    return new this(user.sub)
  }

  #validateEmailNotification(notification: EmailNotification) {
    if (!notification.name)
      throw new Response('name must not be empty', { status: 400 })
    if (!notification.recipient)
      throw new Response('recipient must not be empty', { status: 400 })
    if (!notification.topics)
      throw new Response('topics must not be empty', { status: 400 })
    if (!validate(notification.recipient))
      throw new Response('email address is invalid', { status: 400 })
  }

  // Create
  async createEmailNotification(notification: EmailNotification) {
    this.#validateEmailNotification(notification)

    const created = Date.now()
    const uuid = crypto.randomUUID()

    const db = await tables()
    const main = db.email_notification.put({
      sub: this.#sub,
      uuid,
      name: notification.name,
      created,
      topics: notification.topics,
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
      },
      ExpressionAttributeValues: {
        ':sub': this.#sub,
      },
      ProjectionExpression: '#uuid, #created, #name, #topics, #recipient',
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
    if (!email_notification.uuid)
      throw new Response('uuid must not be empty', { status: 400 })
    this.#validateEmailNotification(email_notification)

    const db = await tables()
    await db.email_notification.update({
      Key: { sub: this.#sub, uuid: email_notification.uuid },
      UpdateExpression:
        'set #name = :name, #recipient = :recipient, #topics = :topics',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#topics': 'topics',
        '#recipient': 'recipient',
      },
      ExpressionAttributeValues: {
        ':name': email_notification.name,
        ':recipient': email_notification.recipient,
        ':topics': email_notification.topics,
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
  async sendTestEmail(recipient: string) {
    await sendEmail({
      fromName: 'GCN Notices',
      recipient,
      subject: 'GCN Notices test',
      body: 'This is a test message from the GCN Notices.',
    })
  }
}
