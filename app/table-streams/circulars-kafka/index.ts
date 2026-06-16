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
      await send(
        'gcn.circulars',
        JSON.stringify({
          $schema: circularsJsonSchemaId,
          ...cleanedCircular,
        })
      )
    }
  }
)
