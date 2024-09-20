/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { services, tables } from '@architect/functions'
import type {
  BulkEmailEntry,
  SendBulkEmailCommandInput,
  SendEmailCommandInput,
} from '@aws-sdk/client-sesv2'
import {
  SESv2Client,
  SESv2ServiceException,
  SendBulkEmailCommand,
  SendEmailCommand,
} from '@aws-sdk/client-sesv2'
import { paginateQuery, paginateScan } from '@aws-sdk/lib-dynamodb'
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import chunk from 'lodash/chunk'

import { hostname, origin } from './env.server'
import { getEnvBannerHeaderAndDescription } from './utils'
import type { Circular } from '~/routes/circulars/circulars.lib'
import { formatCircularText } from '~/routes/circulars/circulars.lib'
import { encodeToURL } from '~/routes/unsubscribe.$jwt/jwt.server'

const client = new SESv2Client({})
// https://docs.aws.amazon.com/ses/latest/dg/quotas.html
const maxRecipientsPerMessage = 50
const fromName = 'GCN Circulars'

interface MessageProps {
  /** The name to show in the From: address. */
  fromName: string
  /** The reply-to addresses. */
  replyTo?: string[]
  /** The subject of the email. */
  subject: string
  /** The body of the email. */
  body: string
  /** Email recipients. */
  to: string[]
}

interface BulkMessageProps extends MessageProps {
  /** The topic key (for unsubscribing). */
  topic: string
}

function getBody(body: string) {
  if (hostname !== 'gcn.nasa.gov') {
    const { heading, description } = getEnvBannerHeaderAndDescription(hostname)
    body =
      `******** ${heading}: This notification is from ${description} of GCN. For the production version, go to https://gcn.nasa.gov/ ********

` + body
  }
  return body
}

function getFrom(fromName: string) {
  return `${fromName} <no-reply@${hostname}>`
}

async function sendSES(sendCommandInput: SendEmailCommandInput) {
  const command = new SendEmailCommand(sendCommandInput)
  try {
    await client.send(command)
  } catch (e) {
    if (
      !(
        e instanceof SESv2ServiceException &&
        ['InvalidClientTokenId', 'UnrecognizedClientException'].includes(e.name)
      ) ||
      process.env.NODE_ENV === 'production'
    ) {
      throw e
    } else {
      console.warn(`SES threw ${e.name}. This would be an error in production.`)
    }
  }
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

/** Send an email to many recipients in parallel. */
export async function sendEmailBulk({
  to,
  fromName,
  replyTo,
  subject,
  body,
  topic,
}: BulkMessageProps) {
  const s = await services()
  const message: Omit<SendBulkEmailCommandInput, 'BulkEmailEntries'> = {
    FromEmailAddress: getFrom(fromName),
    ReplyToAddresses: replyTo,
    DefaultContent: {
      Template: {
        TemplateData: JSON.stringify({
          subject,
          body: getBody(body),
        }),
        TemplateName: s.emailOutgoing.template,
      },
    },
  }
  await Promise.all(
    chunk(to, maxRecipientsPerMessage).map(async (addresses) => {
      const BulkEmailEntries: BulkEmailEntry[] = await Promise.all(
        addresses.map(async (address) => ({
          Destination: { ToAddresses: [address] },
          ReplacementEmailContent: {
            ReplacementTemplate: {
              ReplacementTemplateData: JSON.stringify({
                perUserBody: `\n---\nTo unsubscribe, open this link in a web browser:\n${await encodeToURL(
                  { email: address, topics: [topic] }
                )}`,
              }),
            },
          },
        }))
      )
      await client.send(
        new SendBulkEmailCommand({ BulkEmailEntries, ...message })
      )
    })
  )
}

/** Send an email to one To: recipient. */
export async function sendEmail({
  to,
  fromName,
  replyTo,
  subject,
  body,
}: MessageProps) {
  await sendSES({
    Destination: {
      ToAddresses: to,
    },
    FromEmailAddress: getFrom(fromName),
    ReplyToAddresses: replyTo,
    Content: {
      Simple: {
        Subject: {
          Data: subject,
        },
        Body: {
          Text: {
            Data: getBody(body),
          },
        },
      },
    },
  })
}
