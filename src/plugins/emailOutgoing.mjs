/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// Grant the Lambda function permission to send email; add email templates.
export const deploy = {
  start({ cloudformation }) {
    cloudformation.Resources.Role.Properties.Policies.push({
      PolicyName: 'ArcSesPolicy',
      PolicyDocument: {
        Statement: [
          {
            Effect: 'Allow',
            Action: [
              'ses:SendEmail',
              'ses:SendBulkEmail',
              'ses:SendBulkTemplatedEmail',
              'ses:SendRawEmail',
            ],
            Resource: [
              {
                'Fn::Sub': `arn:\${AWS::Partition}:ses:\${AWS::Region}:\${AWS::AccountId}:identity/*`,
              },
              {
                'Fn::Sub': `arn:\${AWS::Partition}:ses:\${AWS::Region}:\${AWS::AccountId}:configuration-set/*`,
              },
              {
                'Fn::Sub': `arn:\${AWS::Partition}:ses:\${AWS::Region}:\${AWS::AccountId}:template/*`,
              },
            ],
          },
        ],
      },
    })
    cloudformation.Resources.EmailOutgoingTemplate = {
      Type: 'AWS::SES::Template',
      Properties: {
        Template: {
          SubjectPart: '{{subject}}',
          TextPart: '{{body}}{{perUserBody}}',
        },
      },
    }
    return cloudformation
  },
  services({ stage }) {
    if (stage === 'production') {
      return { template: { Ref: 'EmailOutgoingTemplate' } }
    } else {
      return {}
    }
  },
}
