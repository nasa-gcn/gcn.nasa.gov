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
import type { Pack } from 'tar-stream'
import { pack as tarPack } from 'tar-stream'

import type { CircularActionContext } from './circularAction'
import { getEnvOrDie } from '~/lib/env.server'
import type { Circular } from '~/routes/circulars/circulars.lib'
import { formatCircular } from '~/routes/circulars/circulars.lib'

interface TarContextObject {
  pack: Pack
  readableTar: Readable | ReadableStream<Uint8Array>
  fileType: string
}

async function uploadStream(tarContext: TarContextObject) {
  const s3 = new S3Client({})
  const Bucket = getEnvOrDie('ARC_STATIC_BUCKET')

  await s3.send(
    new PutObjectCommand({
      Bucket,
      Key: `circulars.archive.${tarContext.fileType}.tar`,
      Body: tarContext.readableTar,
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
}) {
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
  return { context: { pack, readableTar } }
}

export function setupTar() {
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

  return { context: { pack, tarStream } }
}

export async function finalizeTar(context: CircularActionContext) {
  const finalContext = context as unknown as TarContextObject
  finalContext.pack.finalize()
  const readableTar = createReadableStreamFromReadable(
    Readable.from(finalContext.readableTar as Readable)
  )
  await uploadStream({
    readableTar,
    fileType: finalContext.fileType,
    pack: finalContext.pack,
  })
}

export async function uploadTxtTar(circularArray: Circular[], context: any) {
  return await makeTarFile({
    pack: context.pack,
    readableTar: context.readableTar,
    circularArray,
    fileType: 'txt',
  })
}

export async function uploadJsonTar(circularArray: Circular[], context: any) {
  return await makeTarFile({
    pack: context.pack,
    readableTar: context.readableTar,
    circularArray,
    fileType: 'json',
  })
}
