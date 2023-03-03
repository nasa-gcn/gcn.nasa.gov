/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

// Enable notifications from SES to SNS to trigger email-incoming Lambda
export const deploy = {
  start({ cloudformation }) {
    const { ORIGIN } =
      cloudformation.Resources.EmailIncomingEventLambda.Properties.Environment
        .Variables
    if (!ORIGIN) throw new Error('Environment variable ORIGIN must be defined')
    const hostname = new URL(ORIGIN).hostname

    Object.assign(cloudformation.Resources, {
      EmailIncomingReceiptRuleSet: { Type: 'AWS::SES::ReceiptRuleSet' },
      EmailIncomingReceiptRule: {
        Type: 'AWS::SES::ReceiptRule',
        Properties: {
          RuleSetName: { Ref: 'EmailIncomingReceiptRuleSet' },
          Rule: {
            Enabled: true,
            Recipients: [`circulars@${hostname}`],
            Actions: [
              {
                SNSAction: {
                  Encoding: 'Base64',
                  TopicArn: { Ref: 'EmailIncomingEventTopic' },
                },
              },
            ],
            ScanEnabled: true,
          },
        },
      },
    })
    return cloudformation
  },
}
