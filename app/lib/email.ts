/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import {
  MessageRejected,
  SendEmailCommand,
  SESv2Client,
  SESv2ServiceException,
} from '@aws-sdk/client-sesv2'
import { getHostname } from './env'

const client = new SESv2Client({})

export async function sendEmail(
  fromName: string,
  recipient: string,
  subject: string,
  body: string
) {
  const hostname = getHostname()

  const command = new SendEmailCommand({
    Destination: {
      ToAddresses: [recipient],
    },
    FromEmailAddress: `${fromName} <no-reply@${hostname}>`,
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
  })

  try {
    await client.send(command)
  } catch (e) {
    if (e instanceof MessageRejected && hostname == 'localhost') {
      console.warn(`Emails will not send if ORIGIN is unset. The following would be sent: 
      ${body}
      `)
    } else if (
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
