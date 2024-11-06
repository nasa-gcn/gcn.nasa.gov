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

// Export handler entrypoint for instrumentation with OpenTelemetry.
// From https://aws-otel.github.io/docs/getting-started/lambda/lambda-js#requirements:
//
// > For TypeScript users, if you are using esbuild (either directly or through
// > tools such as the AWS CDK), you must export your handler function through
// > module.exports rather than with the export keyword! The AWS mananaged layer
// > for ADOT JavaScript needs to hot-patch your handler at runtime, but can't
// > because esbuild makes your handler immutable when using the export keyword.
module.exports.handler = createEmailIncomingMessageHandler(
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
