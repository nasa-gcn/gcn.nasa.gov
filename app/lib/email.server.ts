/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
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
import truncate from 'truncate-utf8-bytes'

import { hostname, origin } from './env.server'
import { getEnvBannerHeaderAndDescription, maybeThrow } from './utils'
import { encodeToURL } from '~/routes/unsubscribe.$jwt/jwt.server'

const client = new SESv2Client({})
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
  circularId?: number
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

function maybeThrowSES(e: any, warning: string) {
  const formattedWarning = `SES threw ${(e as SESv2ServiceException).name}. This would be an error in production. Since we are in ${process.env.NODE_ENV}, ${warning}.`

  maybeThrow<SESv2ServiceException>(e, formattedWarning, [
    'ExpiredTokenException',
    'NotAuthorizedException',
    'UnrecognizedClientException',
  ])
}

/**
 * Amazon SES has a byte limit of 262144 for TemplateData arguments.
 * If the circular body is over this size limit, the message will be truncated.
 * If the body is truncated, the circular website link will be removed.
 * A warning that the email has been truncated is added and the circular website link is added back in.
 * An additional buffer is allowed for for variation in url length and truncation warning.
 */
export function truncateEmailBodyIfNecessary({
  body,
  circularId,
}: {
  body: string
  circularId?: number
}) {
  const textBody = getBody(body)

  if (Buffer.byteLength(textBody, 'utf-8') <= 262144) return textBody

  const truncatedBody = truncate(textBody, 261900)
  const truncationWarning =
    circularId && origin
      ? `...\n\n\n This message has been truncated. The full text is available on the website.\n\n\nView this GCN Circular online at ${origin}/circulars/${
          circularId
        }.`
      : '...\n\n\n This message has been truncated. The full text is available on the website.'

  return truncatedBody + truncationWarning
}

/** Send an email to many recipients in parallel. */
export async function sendEmailBulk({
  to,
  fromName,
  replyTo,
  subject,
  body,
  topic,
  circularId,
}: BulkMessageProps) {
  const s = await services()
  const emailBody = truncateEmailBodyIfNecessary({ body, circularId })
  const message: Omit<SendBulkEmailCommandInput, 'BulkEmailEntries'> = {
    FromEmailAddress: getFrom(fromName),
    ReplyToAddresses: replyTo,
    DefaultContent: {
      Template: {
        TemplateData: JSON.stringify({
          subject,
          body: emailBody,
        }),
        TemplateName: s.email_outgoing?.template,
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
      try {
        await client.send(
          new SendBulkEmailCommand({ BulkEmailEntries, ...message })
        )
      } catch (e) {
        maybeThrowSES(e, 'email will not be sent')
      }
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
