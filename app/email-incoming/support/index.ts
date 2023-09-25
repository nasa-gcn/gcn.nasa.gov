/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'
import {
  processMessage,
  transformRecipients,
  /* @ts-expect-error: aws-lambda-ses-forwarder does not have type definitions */
} from 'aws-lambda-ses-forwarder'

import { createEmailIncomingMessageHandler } from '../handler'
import { getEnvOrDie, hostname } from '~/lib/env.server'

const origEmail = `support@${hostname}`
const zendeskEmail = getEnvOrDie('ZENDESK_EMAIL')
const sesv2 = new SESv2Client({})

const origData = {
  callback(error: any) {
    throw error
  },
  config: {
    allowPlusSign: true,
    forwardMapping: { [origEmail]: [zendeskEmail] },
    fromEmail: origEmail,
  },
  log: console.log,
}

/**
 * Forward incoming emails to Zendesk.
 */
export const handler = createEmailIncomingMessageHandler(
  async ({ content, receipt: { recipients } }) => {
    let data = { recipients, emailData: content.toString(), ...origData }
    data = await transformRecipients(data)
    data = await processMessage(data)
    await sesv2.send(
      new SendEmailCommand({
        Content: { Raw: { Data: Buffer.from(data.emailData) } },
        Destination: { ToAddresses: [zendeskEmail] },
      })
    )
  }
)
