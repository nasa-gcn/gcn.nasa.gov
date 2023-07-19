/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { services } from '@architect/functions'
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
import chunk from 'lodash/chunk'

import { getHostname } from './env.server'
import { getEnvBannerHeaderAndDescription } from './utils'
import { encodeToURL } from '~/routes/unsubscribe/jwt.server'

const client = new SESv2Client({})
const hostname = getHostname()
// https://docs.aws.amazon.com/ses/latest/dg/quotas.html
const maxRecipientsPerMessage = 50

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

async function send(sendCommandInput: SendEmailCommandInput) {
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
                perUserBody: `\n\n\n---\nTo unsubscribe, open this link in a web browser:\n${await encodeToURL(
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
  await send({
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
