/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { createReadableStreamFromReadable } from '@remix-run/node'
import { Readable } from 'stream'
import { pack as tarPack } from 'tar-stream'

import { getEnvOrDie } from '~/lib/env.server'
import type { Circular } from '~/routes/circulars/circulars.lib'
import { formatCircular } from '~/routes/circulars/circulars.lib'

async function uploadStream({
  pack,
  readableTar,
  circularArray,
  fileType,
}: {
  pack: any
  readableTar: Readable
  circularArray: Circular[]
  fileType: 'txt' | 'json'
}) {
  const s3 = new S3Client({})
  const Bucket = getEnvOrDie('ARC_STATIC_BUCKET')
  const tarball = await makeTarFile({
    pack,
    readableTar,
    circularArray,
    fileType,
  })
  await s3.send(
    new PutObjectCommand({
      Bucket,
      Key: `circulars.archive.${fileType}.tar`,
      Body: tarball,
    })
  )
}

export async function makeTarFile({
  pack,
  readableTar,
  circularArray,
  fileType,
}: {
  pack: any
  readableTar: Readable
  circularArray: Circular[]
  fileType: 'txt' | 'json'
}): Promise<ReadableStream> {
  for (const circular of circularArray) {
    if (fileType === 'txt') {
      const txt_entry = pack.entry(
        { name: `archive.txt/${circular.circularId}.txt` },
        formatCircular(circular)
      )
      txt_entry.end()
    } else if (fileType === 'json') {
      delete circular.sub
      const json_entry = pack.entry(
        { name: `archive.json/${circular.circularId}.json` },
        JSON.stringify(circular, null, 2)
      )
      json_entry.end()
    }
  }
  pack.finalize()

  return createReadableStreamFromReadable(Readable.from(readableTar))
}

async function setup() {
  const tarStream = new Readable({
    read() {},
  })

  const pack = tarPack()

  pack.on('error', (err: Error) => {
    tarStream.emit('error', err)
  })

  pack.on('data', (chunk: Uint8Array) => {
    tarStream.push(chunk)
  })

  pack.on('end', () => {
    tarStream.push(null)
  })

  const readableTar = Readable.from(tarStream)
  return { pack, readableTar }
}

async function uploadTxtTar(circularArray: Circular[]) {
  const { pack, readableTar } = await setup()
  await uploadStream({ pack, readableTar, circularArray, fileType: 'txt' })
}

async function uploadJsonTar(circularArray: Circular[]) {
  const { pack, readableTar } = await setup()
  await uploadStream({ pack, readableTar, circularArray, fileType: 'json' })
}

// FIXME: must use module.exports here for OpenTelemetry shim to work correctly.
// See https://dev.to/heymarkkop/how-to-solve-cannot-redefine-property-handler-on-aws-lambda-3j67
export async function uploadTar(circularArray: Circular[]) {
  uploadTxtTar(circularArray)
  uploadJsonTar(circularArray)
}
