/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { toLogicalID } from '@architect/utils'

function getLambdaName(key) {
  return `${key}-eventbridge`
}

export const set = {
  customLambdas({ arc: { eventbridge } }) {
    return eventbridge.map((item) => {
      const [[key, { src }]] = Object.entries(item)
      return {
        name: getLambdaName(key),
        src,
      }
    })
  },
}

export const deploy = {
  start({ cloudformation, arc: { eventbridge } }) {
    eventbridge.forEach((item) => {
      const [[key, { source, detailType, eventName }]] = Object.entries(item)
      const logicalID = toLogicalID(getLambdaName(key))

      cloudformation.Resources[`${logicalID}EventRule`] = {
        Type: 'AWS::Events::Rule',
        Properties: {
          EventPattern: {
            source: source && [source],
            'detail-type': detailType && [detailType],
            detail: eventName && {
              eventName: [eventName],
            },
          },
          State: 'ENABLED',
          EventBusName: 'default',
          Targets: [
            {
              Id: logicalID,
              Arn: {
                'Fn::GetAtt': `${logicalID}CustomLambda.Arn`,
              },
            },
          ],
        },
      }

      cloudformation.Resources[`${logicalID}Permission`] = {
        Type: 'AWS::Lambda::Permission',
        Properties: {
          Action: 'lambda:InvokeFunction',
          FunctionName: {
            Ref: `${logicalID}CustomLambda`,
          },
          Principal: 'events.amazonaws.com',
          SourceArn: {
            'Fn::GetAtt': `${logicalID}EventRule.Arn`,
          },
        },
      }
    })
  },
}
