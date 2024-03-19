/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Upload } from '@aws-sdk/lib-storage'
import { basename } from 'node:path'
import { PassThrough } from 'node:stream'
import { createGzip } from 'node:zlib'
import type { Pack } from 'tar-stream'
import { pack as tarPack } from 'tar-stream'

import type { CircularAction } from '../actions'
import { Prefix, putParams, s3 } from '../storage'
import { staticBucket as Bucket, region } from '~/lib/env.server'
import type { Circular } from '~/routes/circulars/circulars.lib'
import {
  formatCircularJson,
  formatCircularText,
} from '~/routes/circulars/circulars.lib'

const archiveSuffix = '.tar.gz'

export function getBucketKey(suffix: string) {
  return `${Prefix}/archive.${suffix}${archiveSuffix}`
}

function getBucketUrl(region: string, bucket: string, key: string) {
  return `https://s3.${region}.amazonaws.com/${bucket}/${key}`
}

export function getArchiveURL(suffix: string) {
  return getBucketUrl(region, Bucket, getBucketKey(suffix))
}

function createUploadAction(
  suffix: string,
  formatter: (circular: Circular) => string
): CircularAction<{ pack: Pack; promise: Promise<any> }> {
  const Key = getBucketKey(suffix)
  const tarDir = basename(Key, archiveSuffix)

  return {
    initialize() {
      const pack = tarPack()
      const gzip = createGzip()
      const Body = new PassThrough()
      pack.pipe(gzip).pipe(Body)
      const promise = new Upload({
        client: s3,
        params: {
          Body,
          Key,
          ContentType: 'application/gzip',
          ...putParams,
        },
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
