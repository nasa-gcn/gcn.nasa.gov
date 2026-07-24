/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { DynamoDBRecord } from 'aws-lambda'

import { unmarshallTrigger } from '../utils'
import { send } from '~/lib/kafka.server'
import { createTriggerHandler } from '~/lib/lambdaTrigger.server'
import type { Circular } from '~/routes/circulars/circulars.lib'

import { $id as circularsJsonSchemaId } from '@nasa-gcn/schema/gcn/circulars.schema.json'

export const handler = createTriggerHandler(
  async ({ eventName, dynamodb }: DynamoDBRecord) => {
    if (eventName === 'INSERT' || eventName === 'MODIFY') {
      const circular = unmarshallTrigger(dynamodb!.NewImage) as Circular
      const { sub, ...cleanedCircular } = circular

      const value = JSON.stringify({
        $schema: circularsJsonSchemaId,
        ...cleanedCircular,
      })

      const topics = [
        'gcn.circulars',
        ...(circular.eventType ?? []).map(
          (eventType) =>
            `gcn.circulars.${eventType.toLowerCase().replaceAll(' ', '_')}`
        ),
      ]

      await Promise.all(topics.map((topic) => send(topic, value)))
    }
  }
)
