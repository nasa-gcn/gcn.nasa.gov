/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file An Architect plugin to trigger custom Lambdas for emails received by
 * Amazon Simple Email Service (SES). To configure this plugin, add the
 * following to your `app.arc` project manifest file:
 *
 *    @plugins
 *    email-incoming
 *
 *    @email-incoming
 *    recipient
 *      src path/to/lambda
 *
 * This adds an Amazon SES receipt rule set that is triggered whenever an email
 * is received for the address recipient@hostname. The recipient is the value
 * given in the project manifest. The hostname is the hostname portion of the
 * URL stored in an environment variable called ORIGIN.
 *
 * You may configure as many email recipients as you like. For example:
 *
 *    @plugins
 *    email-incoming
 *
 *    @email-incoming
 *    support
 *      src path/to/support/lambda
 *
 *    admin
 *      src path/to/admin/lambda
 */
import { toLogicalID } from '@architect/utils'

function getLambdaName(key) {
  return `${key}-email-incoming`
}

export const set = {
  events({ arc: { 'email-incoming': emailIncoming } }) {
    return emailIncoming.map((item) => {
      const [[key, { src }]] = Object.entries(item)
      return {
        name: getLambdaName(key),
        src,
      }
    })
  },
}

export const deploy = {
  start({ cloudformation, arc: { 'email-incoming': emailIncoming } }) {
    cloudformation.Resources.EmailIncomingReceiptRuleSet = {
      Type: 'AWS::SES::ReceiptRuleSet',
    }

    emailIncoming.forEach((item) => {
      const [key] = Object.keys(item)
      const logicalID = toLogicalID(getLambdaName(key))

      const { ORIGIN } =
        cloudformation.Resources[`${logicalID}EventLambda`].Properties
          .Environment.Variables
      if (!ORIGIN)
        throw new Error('Environment variable ORIGIN must be defined')
      const hostname = new URL(ORIGIN).hostname

      cloudformation.Resources[`${logicalID}ReceiptRule`] = {
        Type: 'AWS::SES::ReceiptRule',
        Properties: {
          RuleSetName: { Ref: 'EmailIncomingReceiptRuleSet' },
          Rule: {
            Enabled: true,
            Recipients: [`${key}@${hostname}`],
            Actions: [
              {
                SNSAction: {
                  Encoding: 'Base64',
                  TopicArn: { Ref: `${logicalID}EventTopic` },
                },
              },
            ],
            ScanEnabled: true,
          },
        },
      }
    })

    return cloudformation
  },
}
