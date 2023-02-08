/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

// Add a custom Lambda to process events for incoming emails
export const set = {
  events() {
    return {
      name: 'email-incoming',
      src: 'email-incoming',
      required: true,
    }
  },
}

export const deploy = {
  start({ cloudformation }) {
    const { DOMAIN } =
      cloudformation.Resources.EmailIncomingEventLambda.Properties.Environment
        .Variables
    Object.assign(cloudformation.Resources, {
      EmailIncomingReceiptRuleSet: { Type: 'AWS::SES::ReceiptRuleSet' },
      EmailIncomingReceiptRule: {
        Type: 'AWS::SES::ReceiptRule',
        Properties: {
          RuleSetName: { Ref: 'EmailIncomingReceiptRuleSet' },
          Enabled: true,
          Recipients: [`circulars@${DOMAIN}`],
          Actions: [
            {
              SNSAction: {
                Encoding: 'Base64',
                TopicArn: { Ref: 'EmailIncomingEventTopic' },
              },
            },
          ],
        },
      },
    })
    return cloudformation
  },
}
