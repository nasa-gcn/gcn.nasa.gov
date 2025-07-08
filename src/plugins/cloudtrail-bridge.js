/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

export const deploy = {
  start({ cloudformation, arc }) {
    cloudformation.Resources.CloudTrailEventRule = {
      Type: 'AWS::Events::Rule',
      Properties: {
        Name: 'CloudtrailEventRule',
        EventPattern: {
          source: ['aws.cognito-idp'],
          'detail-type': ['AWS Service Event via CloudTrail'],
          detail: {
            eventName: ['Token_POST'],
          },
        },
        State: 'ENABLED',
        EventBusName: 'default',
        Targets: [
          {
            Id: 'CloudTrailEventTarget',
            Arn: {
              'Fn::Sub': `arn:\${AWS::Partition}:lambda:\${AWS::Region}:\${AWS::AccountId}:function:{function name}`,
            },
          },
        ],
      },
    }
  },
}
