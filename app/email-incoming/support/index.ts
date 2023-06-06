/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { SESv2Client } from '@aws-sdk/client-sesv2'
import {
  processMessage,
  sendMessage,
  transformRecipients,
  /* @ts-expect-error: aws-lambda-ses-forwarder does not have type definitions */
} from 'aws-lambda-ses-forwarder'

import { createEmailIncomingMessageHandler } from '../handler'
import { getEnvOrDie, getHostname } from '~/lib/env.server'

const hostname = getHostname()
const origEmail = `support@${hostname}`
const zendeskEmail = getEnvOrDie('ZENDESK_EMAIL')

const origData = {
  callback(error: any) {
    throw error
  },
  config: {
    allowPlusSign: true,
    forwardMapping: { [origEmail]: [zendeskEmail] },
    fromEmail: origEmail,
    toEmail: zendeskEmail,
  },
  log: console.log,
  ses: new SESv2Client({}),
}

/**
 * Forward incoming emails to Zendesk.
 *
 * FIXME: must use module.exports here for OpenTelemetry shim to work correctly.
 * See https://dev.to/heymarkkop/how-to-solve-cannot-redefine-property-handler-on-aws-lambda-3j67
 */
module.exports.handler = createEmailIncomingMessageHandler(
  async ({ content, receipt: { recipients } }) => {
    let data = { recipients, emailData: content.toString(), ...origData }
    data = await transformRecipients(data)
    data = await processMessage(data)
    await sendMessage(data)
  }
)
