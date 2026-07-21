/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { ListObjectsV2CommandOutput } from '@aws-sdk/client-s3'
import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3'
import type { Source } from 'mailparser'

import { parseEmailContentFromSource } from '~/email-incoming/circulars/parse'
import { getEnvOrDie } from '~/lib/env.server'

const s3Client = new S3Client({})
const targetDate = new Date('2026-01-01')
const Bucket = getEnvOrDie('EMAIL_BUCKET')

export const handler = async () => {
  const allKeys = []
  let isTruncated: boolean | undefined = true
  let ContinuationToken = undefined

  try {
    while (isTruncated) {
      const command = new ListObjectsV2Command({
        Bucket,
        ContinuationToken,
        Prefix: 'circulars/',
      })

      const response: ListObjectsV2CommandOutput = await s3Client.send(command)

      if (
        response.Contents?.filter(
          (item) =>
            item.LastModified &&
            new Date(item.LastModified).toDateString() >=
              targetDate.toDateString()
        )
      ) {
        const keys = response.Contents.map((item) => item.Key)
        allKeys.push(...keys)
      }
      isTruncated = response.IsTruncated
      ContinuationToken = response.NextContinuationToken
    }

    const results = await Promise.all(
      allKeys.map(async (Key) =>
        parseEmailContentFromSource(
          (await s3Client.send(new GetObjectCommand({ Bucket, Key })))
            .Body as Source
        )
      )
    )

    const failedDmarc = results.filter(
      (item) =>
        !item.headers
          .get('authentication-results')
          ?.toString()
          .includes('dmarc=pass')
    )
    console.log(failedDmarc)
    return failedDmarc
  } catch (error) {
    console.error('Pagination error:', error)
  }
}
