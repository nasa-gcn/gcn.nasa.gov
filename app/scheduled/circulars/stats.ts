/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

import type { CircularAction } from './circularAction'
import { staticBucket as Bucket } from '~/lib/env.server'

const s3 = new S3Client({})
const Key = 'generated/circulars/stats.json'

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
    await s3.send(new PutObjectCommand({ Bucket, Key, Body }))
  },
}
