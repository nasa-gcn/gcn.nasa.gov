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

import type { CircularAction } from './circularAction'
import { getEnvOrDie } from '~/lib/env.server'
import type { Circular } from '~/routes/circulars/circulars.lib'
import { formatCircular } from '~/routes/circulars/circulars.lib'

interface TarContext {
  pack: Pack
  tarStream: Readable | ReadableStream<Uint8Array>
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

async function uploadStream(tarContext: TarContext) {
  await s3.send(
    new PutObjectCommand({
      Bucket,
      Key: `circulars.archive.${tarContext.fileType}.tar`,
      Body: tarContext.tarStream,
    })
  )
}

export async function makeTarFile({
  pack,
  circulars,
  fileType,
}: {
  pack: Pack
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

  return { pack, tarStream } as TarContext
}

export async function finalizeTar(context: TarContext) {
  context.pack.finalize()
  const readableTar = createReadableStreamFromReadable(
    Readable.from(context.tarStream as Readable)
  )
  await uploadStream({
    pack: context.pack,
    tarStream: readableTar,
    fileType: context.fileType,
  })
}

export async function uploadTxtTar(circulars: Circular[], context: TarContext) {
  return await makeTarFile({
    pack: context.pack,
    circulars,
    fileType: 'txt',
  })
}

export async function uploadJsonTar(
  circulars: Circular[],
  context: TarContext
) {
  return await makeTarFile({
    pack: context.pack,
    circulars,
    fileType: 'json',
  })
}

export const jsonUploadAction: CircularAction<TarContext> = {
  action: uploadJsonTar,
  initialize: setupTar,
  finalize: finalizeTar,
}

export const txtUploadAction: CircularAction<TarContext> = {
  action: uploadTxtTar,
  initialize: setupTar,
  finalize: finalizeTar,
}
