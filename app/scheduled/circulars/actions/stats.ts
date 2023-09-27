/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { PutObjectCommand } from '@aws-sdk/client-s3'

import type { CircularAction } from '../actions'
import { Prefix, putParams, s3 } from '../storage'

const Key = `${Prefix}/stats.json`

export const statsAction: CircularAction<Record<string, number>> = {
  initialize() {
    return {}
  },
  action(circulars, context) {
    circulars.forEach(({ submittedHow }) => {
      if (submittedHow) {
        if (context[submittedHow] === undefined) context[submittedHow] = 0
        context[submittedHow] += 1
      }
    })
  },
  async finalize(context) {
    const Body = JSON.stringify(context)
    await s3.send(
      new PutObjectCommand({
        Key,
        Body,
        ContentType: 'application/json',
        ...putParams,
      })
    )
  },
}
