/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { tables } from '@architect/functions'
import { getUser } from '~/routes/__auth/user.server'
import {
  mapFormatAndNoticeTypesToTopics,
  mapTopicsToFormatAndNoticeTypes,
} from '~/lib/utils'

export type EmailNotification = {
  name: string
  recipient: string
  format: string
  noticeTypes: string[]
  created: number
  active: boolean
  uuid?: string
  topics: string[]
}

export class EmailNotificationVendingMachine {
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

  // Create
  async createEmailNotification(
    active: boolean,
    name: string,
    recipient: string,
    format: string,
    noticeTypes: string[]
  ): Promise<EmailNotification> {
    if (!name) throw new Response('name must not be empty', { status: 400 })
    if (!recipient)
      throw new Response('recipient must not be empty', { status: 400 })
    if (!format) throw new Response('format must not be empty', { status: 400 })

    const created = Date.now()
    const topics = mapFormatAndNoticeTypesToTopics(format, noticeTypes)
    const uuid = crypto.randomUUID()

    const db = await tables()
    await db.email_notification.put({
      sub: this.#sub,
      uuid,
      name,
      created,
      topics,
      active,
      recipient,
    })

    return { name, created, recipient, format, active, topics, noticeTypes }
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
    const emailNotifications = results.Items as EmailNotification[]
    for (const notice of emailNotifications) {
      let mappedData = mapTopicsToFormatAndNoticeTypes(notice.topics)
      notice.format = mappedData.noticeFormat
      notice.noticeTypes = mappedData.noticeTypes
    }
    emailNotifications.sort((a, b) => a.created - b.created)
    return emailNotifications
  }

  async getEmailNotification(uuid: string): Promise<EmailNotification> {
    const db = await tables()
    const item = (await db.email_notification.get({
      sub: this.#sub,
      uuid,
    })) as ({ sub: string } & EmailNotification) | null
    if (!item) throw new Response(null, { status: 404 })

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
    db.email_notification.update(
      {
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
      },
      (err, data) => {
        if (err) console.log(err)
        else console.log(data)
      }
    )
  }

  // Delete
  async deleteEmailNotification(uuid: string) {
    const db = await tables()
    const item = await db.email_notification.get({
      sub: this.#sub,
      notice_id,
    })
    if (!item) throw new Response(null, { status: 404 })

    await db.email_notification.delete({ sub: this.#sub, notice_id })
  }
}
