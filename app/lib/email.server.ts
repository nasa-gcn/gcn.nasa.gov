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

import { getHostname } from './env.server'

const client = new SESv2Client({})

// https://docs.aws.amazon.com/ses/latest/dg/quotas.html
const maxRecipientsPerMessage = 50

interface BaseMessageProps {
  /** The name to show in the From: address. */
  fromName: string
  /** The subject of the email. */
  subject: string
  /** The body of the email. */
  body: string
}

function getBaseMessage({
  fromName,
  subject,
  body,
}: BaseMessageProps): Omit<SendEmailCommandInput, 'Destination'> {
  return {
    FromEmailAddress: `${fromName} <no-reply@${getHostname()}>`,
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
export async function sendEmailBulk({
  recipients,
  ...props
}: BaseMessageProps & { recipients: string[] }) {
  const message = getBaseMessage(props)
  await Promise.all(
    chunk(recipients, maxRecipientsPerMessage).map(async (BccAddresses) => {
      await send({
        Destination: { BccAddresses },
        ...message,
      })
    })
  )
}

/** Send an email to one To: recipient. */
export async function sendEmail({
  recipient,
  ...props
}: BaseMessageProps & { recipient: string }) {
  await send({
    Destination: {
      ToAddresses: [recipient],
    },
    ...getBaseMessage(props),
  })
}
