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
  events({ arc: { eventbridge } }) {
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
      const [key] = Object.keys(item)
      const logicalID = toLogicalID(getLambdaName(key))

      cloudformation.Resources[`${logicalID}EventRule`] = {
        Type: 'AWS::Events::Rule',
        Properties: {
          EventPattern: {
            source: [item[key].source],
            'detail-type': item[key].detailType
              ? [item[key].detailType]
              : undefined,
            detail: item[key].eventName
              ? {
                  eventName: [item[key].eventName],
                }
              : undefined,
          },
          State: 'ENABLED',
          EventBusName: 'default',
          Targets: [
            {
              Id: `${logicalID}EventTarget`,
              Arn: {
                Ref: `${logicalID}EventLambda`,
              },
            },
          ],
        },
      }
    })
  },
}
