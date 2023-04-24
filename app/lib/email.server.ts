/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import type { SendEmailCommandInput } from '@aws-sdk/client-sesv2'
import {
  SESv2Client,
  SESv2ServiceException,
  SendEmailCommand,
} from '@aws-sdk/client-sesv2'
import chunk from 'lodash/chunk'

import { getEnvBannerHeaderAndDescription, getHostname } from './env.server'

const client = new SESv2Client({})
const hostname = getHostname()
// https://docs.aws.amazon.com/ses/latest/dg/quotas.html
const maxRecipientsPerMessage = 50

interface BaseMessageProps {
  /** The name to show in the From: address. */
  fromName: string
  /** The reply-to addresses. */
  replyTo?: string[]
  /** The subject of the email. */
  subject: string
  /** The body of the email. */
  body: string
}

interface MessageProps extends BaseMessageProps {
  /** Email recipients. */
  to: string[]
}

function getBaseMessage({
  fromName,
  replyTo,
  subject,
  body,
}: BaseMessageProps): Omit<SendEmailCommandInput, 'Destination'> {
  if (hostname !== 'gcn.nasa.gov') {
    const { heading, description } = getEnvBannerHeaderAndDescription()
    body =
      `******** ${heading}: This notification is from ${description} of GCN. For the production version, go to https://gcn.nasa.gov/ ********

` + body
  }
  return {
    FromEmailAddress: `${fromName} <no-reply@${hostname}>`,
    ReplyToAddresses: replyTo,
    Content: {
      Simple: {
        Subject: {
          Data: subject,
        },
        Body: {
          Text: {
            Data: body,
          },
        },
      },
    },
  }
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

/** Send an email to many Bcc: recipients. */
export async function sendEmailBcc({ to, ...props }: MessageProps) {
  const message = getBaseMessage(props)
  await Promise.all(
    chunk(to, maxRecipientsPerMessage).map(async (BccAddresses) => {
      await send({
        Destination: { BccAddresses },
        ...message,
      })
    })
  )
}

/** Send an email to one To: recipient. */
export async function sendEmail({ to, ...props }: MessageProps) {
  await send({
    Destination: {
      ToAddresses: to,
    },
    ...getBaseMessage(props),
  })
}
