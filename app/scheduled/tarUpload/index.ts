/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { DynamoDBDocument, paginateScan } from '@aws-sdk/lib-dynamodb'
import { createReadableStreamFromReadable } from '@remix-run/node'
import { Readable } from 'stream'
import { pack as tarPack } from 'tar-stream'

import { getEnvOrDie } from '~/lib/env.server'
import { Circular, formatCircular } from '~/routes/circulars/circulars.lib'

async function uploadStream(fileType: 'json' | 'txt') {
  const s3 = new S3Client({})
  const Bucket = getEnvOrDie('ARC_STATIC_BUCKET')
  const tarball = await makeTarFile(fileType)
  await s3.send(
    new PutObjectCommand({
      Bucket,
      Key: `circulars.archive.${fileType}.tar`,
      Body: tarball,
    })
  )
}

async function* getAllRecords(): AsyncGenerator<Circular[], void, unknown> {
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument
  const TableName = db.name('circulars')
  const pages = paginateScan({ client }, { TableName })

  for await (const page of pages) {
    const items: Circular[] = page.Items as Circular[]
    yield items
  }
}

export async function makeTarFile(
  fileType: 'json' | 'txt'
): Promise<ReadableStream> {
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
  for await (const circularArray of getAllRecords()) {
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
  }

  pack.finalize()

  return createReadableStreamFromReadable(Readable.from(tarStream))
}

// FIXME: must use module.exports here for OpenTelemetry shim to work correctly.
// See https://dev.to/heymarkkop/how-to-solve-cannot-redefine-property-handler-on-aws-lambda-3j67
module.exports.handler = async () => {
  await uploadStream('json')
  await uploadStream('txt')
}
