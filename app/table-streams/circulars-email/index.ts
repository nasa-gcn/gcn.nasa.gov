/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { DynamoDBRecord } from 'aws-lambda'

import { unmarshallTrigger } from '../utils'
import { feature } from '~/lib/env.server'
import { createTriggerHandler } from '~/lib/lambdaTrigger.server'
import type { Circular } from '~/routes/circulars/circulars.lib'
import { send, sendEventTypedEmails } from '~/routes/circulars/circulars.server'

export const handler = createTriggerHandler(
  async ({ eventName, dynamodb }: DynamoDBRecord) => {
    if (eventName === 'INSERT') {
      const circular = unmarshallTrigger(dynamodb!.NewImage) as Circular
      await send(circular)
      if (feature('EVENTTYPE')) await sendEventTypedEmails(circular)
    }
  }
)
