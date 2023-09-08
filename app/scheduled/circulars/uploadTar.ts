/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { basename } from 'node:path'
import { PassThrough } from 'node:stream'
import type { Pack } from 'tar-stream'
import { pack as tarPack } from 'tar-stream'

import type { CircularAction } from './circularAction'
import { staticBucket as Bucket } from '~/lib/env.server'
import type { Circular } from '~/routes/circulars/circulars.lib'
import {
  formatCircularJson,
  formatCircularText,
} from '~/routes/circulars/circulars.lib'

const s3 = new S3Client({})

export function getBucketKey(suffix: string) {
  return `circulars/archive.${suffix}.tar`
}

function createUploadAction(
  suffix: string,
  formatter: (circular: Circular) => string
): CircularAction<{ pack: Pack; promise: Promise<any> }> {
  const Key = getBucketKey(suffix)
  const tarDir = basename(Key, '.tar')

  return {
    initialize() {
      const pack = tarPack()
      const Body = new PassThrough()
      pack.pipe(Body)
      const promise = new Upload({
        client: s3,
        params: { Body, Bucket, Key },
      }).done()
      return { pack, promise }
    },
    action(circulars, { pack }) {
      for (const circular of circulars) {
        const name = `${tarDir}/${circular.circularId}.${suffix}`
        pack.entry({ name }, formatter(circular)).end()
      }
    },
    async finalize({ pack, promise }) {
      pack.finalize()
      await promise
    },
  }
}

export const jsonUploadAction = createUploadAction('json', formatCircularJson)
export const txtUploadAction = createUploadAction('txt', formatCircularText)
