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

import { getEnvOrDie } from '~/lib/env.server'
import type { Circular } from '~/routes/circulars/circulars.lib'
import { formatCircular } from '~/routes/circulars/circulars.lib'

interface TarContextObject {
  pack: Pack
  readableTar: Readable | ReadableStream<Uint8Array>
  fileType: string
}

const formatters: Record<string, (circular: Circular) => string> = {
  json({ sub, ...circular }) {
    return JSON.stringify(circular, null, 2)
  },
  txt: formatCircular,
}

const s3 = new S3Client({})
const Bucket = getEnvOrDie('ARC_STATIC_BUCKET')

async function uploadStream(tarContext: TarContextObject) {
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
  circulars,
  fileType,
}: {
  pack: any
  readableTar: Readable
  circulars: Circular[]
  fileType: 'txt' | 'json'
}) {
  const formatter = formatters[fileType]
  for (const circular of circulars) {
    const name = `archive.${fileType}/${circular.circularId}.${fileType}`
    pack.entry({ name }, formatter(circular)).end()
  }
}

export async function setupTar() {
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

export async function finalizeTar(context: object) {
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

export async function uploadTxtTar(circulars: Circular[], context: any) {
  return await makeTarFile({
    pack: context.pack,
    readableTar: context.readableTar,
    circulars,
    fileType: 'txt',
  })
}

export async function uploadJsonTar(circulars: Circular[], context: any) {
  return await makeTarFile({
    pack: context.pack,
    readableTar: context.readableTar,
    circulars,
    fileType: 'json',
  })
}

export const jsonUploadAction = {
  action: uploadJsonTar,
  initialize: setupTar,
  finalize: finalizeTar,
}

export const txtUploadAction = {
  action: uploadTxtTar,
  initialize: setupTar,
  finalize: finalizeTar,
}
