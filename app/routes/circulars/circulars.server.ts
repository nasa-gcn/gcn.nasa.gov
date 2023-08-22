/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import type { DynamoDB } from '@aws-sdk/client-dynamodb'
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { DynamoDBAutoIncrement } from '@nasa-gcn/dynamodb-autoincrement'
import { createReadableStreamFromReadable, redirect } from '@remix-run/node'
import memoizee from 'memoizee'
import { Readable } from 'stream'
import { pack as tarPack } from 'tar-stream'

import { getUser } from '../_auth/user.server'
import {
  bodyIsValid,
  formatAuthor,
  formatCircular,
  subjectIsValid,
} from './circulars.lib'
import type { Circular, CircularMetadata } from './circulars.lib'
import { search as getSearch } from '~/lib/search.server'

// A type with certain keys required.
type Require<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

export const group = 'gcn.nasa.gov/circular-submitter'

export const getDynamoDBAutoIncrement = memoizee(
  async function () {
    const db = await tables()
    const doc = db._doc as unknown as DynamoDBDocument

    const tableName = db.name('circulars')
    const counterTableName = db.name('auto_increment_metadata')
    const dangerously =
      (await (db._db as unknown as DynamoDB).config.endpoint?.())?.hostname ==
      'localhost'

    return new DynamoDBAutoIncrement({
      doc,
      counterTableName,
      counterTableKey: { tableName: 'circulars' },
      counterTableAttributeName: 'circularId',
      tableName: tableName,
      tableAttributeName: 'circularId',
      initialValue: 1,
      dangerously,
    })
  },
  { promise: true }
)

/** convert a date in format mm-dd-yyyy (or YYYY-MM_DD) to ms since 01/01/1970 */
function parseDate(date?: string) {
  return date ? new Date(date).getTime() : NaN
}

/** take input string and return start/end times based on string value */
function fuzzyTimeRange(fuzzyTime?: string) {
  const now = Date.now()
  switch (fuzzyTime) {
    case 'now': // current time
      return now
    case 'hour': // 1 hour ago
      return now - 3600000
    case 'today': // 00:00:00 of same day
      return new Date().setHours(0, 0, 0, 0)
    case 'day': // 24 hours ago
      return now - 86400000
    case 'week': // 7 days ago
      return now - 86400000 * 7
    case 'month': // 30 days ago
      return now - 86400000 * 30
    case 'year': // 365 days ago
      return now - 86400000 * 365
    case 'mtd': // month to date
      return new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ).getTime()
    case 'ytd': // year to date
      return new Date(new Date().getFullYear(), 0).getTime()
    default:
      return NaN
  }
}

function getValidDates(startDate?: string, endDate?: string) {
  const startTimestamp = fuzzyTimeRange(startDate) || parseDate(startDate)
  const endTimestamp = fuzzyTimeRange(endDate) || parseDate(endDate) + 86400000
  return [startTimestamp, endTimestamp]
}

export async function search({
  query,
  page,
  limit,
  startDate,
  endDate,
}: {
  query?: string
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
}): Promise<{
  items: CircularMetadata[]
  totalPages: number
  totalItems: number
}> {
  const client = await getSearch()

  const [startTime, endTime] = getValidDates(startDate, endDate)

  const {
    body: {
      hits: {
        total: { value: totalItems },
        hits,
      },
    },
  } = await client.search({
    index: 'circulars',
    body: {
      query: {
        bool: {
          must: query
            ? {
                multi_match: {
                  query,
                  fields: ['submitter', 'subject', 'body'],
                },
              }
            : undefined,
          filter: {
            range: {
              createdOn: {
                gte: startTime,
                lte: endTime,
              },
            },
          },
        },
      },
      fields: ['subject'],
      _source: false,
      sort: {
        circularId: {
          order: 'desc',
        },
      },
      from: page && limit && page * limit,
      size: limit,
      track_total_hits: true,
    },
  })

  const items = hits.map(
    ({
      _id: circularId,
      fields: {
        subject: [subject],
      },
    }: {
      _id: string
      fields: { subject: string[] }
    }) => ({
      circularId,
      subject,
    })
  )

  const totalPages = limit ? Math.ceil(totalItems / limit) : 1

  return { items, totalPages, totalItems }
}

/** Get a circular by ID. */
export async function get(circularId: number): Promise<Circular> {
  if (isNaN(circularId)) throw new Response(null, { status: 404 })
  const db = await tables()
  const result = await db.circulars.get({
    circularId,
  })
  if (!result)
    throw new Response(null, {
      status: 404,
    })
  return result
}

/** Delete a circular by ID.
 * Throws an HTTP error if:
 *  - The current user is not signed in
 *  - The current user is not in the moderator group
 */
export async function remove(circularId: number, request: Request) {
  const user = await getUser(request)
  if (!user?.groups.includes('gcn.nasa.gov/circular-moderator'))
    throw new Response('User is not a moderator', {
      status: 403,
    })

  const db = await tables()
  await db.circulars.delete({ circularId })
}

/**
 * Adds a new entry into the GCN Circulars table WITHOUT authentication
 */
export async function putRaw(
  item: Require<Omit<Circular, 'createdOn' | 'circularId'>, 'submittedHow'>
): Promise<Circular> {
  const autoincrement = await getDynamoDBAutoIncrement()
  const createdOn = Date.now()
  const circularId = await autoincrement.put({ createdOn, ...item })
  return { ...item, createdOn, circularId }
}

/**
 * Adds a new entry into the GCN Circulars table
 *
 * Throws an HTTP error if:
 *  - The current user is not signed in, verified by the class's #sub and #groups properties
 *  - The current user is not in the submitters group
 *  - Body or Subject are blank
 * @param body - main content of the Circular
 * @param subject - the title/subject line of the Circular
 */
export async function put(
  item: Require<
    Omit<Circular, 'sub' | 'submitter' | 'createdOn' | 'circularId'>,
    'submittedHow'
  >,
  request: Request
) {
  const user = await getUser(request)
  if (!user?.groups.includes(group))
    throw new Response('User is not in the submitters group', {
      status: 403,
    })
  if (!subjectIsValid(item.subject))
    throw new Response('subject is invalid', { status: 400 })
  if (!bodyIsValid(item.body))
    throw new Response('body is invalid', { status: 400 })

  return await putRaw({
    sub: user.sub,
    submitter: formatAuthor(user),
    ...item,
  })
}

export async function circularRedirect(query: string) {
  const validCircularSearchStyles =
    /^\s*(?:GCN)?\s*(?:CIRCULAR)?\s*(-?\d+(?:\.\d)?)\s*$/i
  const circularId = parseFloat(
    validCircularSearchStyles.exec(query)?.[1] || ''
  )
  if (!isNaN(circularId)) {
    const db = await tables()
    const result = await db.circulars.get({ circularId })
    if (!result) return
    const circularURL = `/circulars/${circularId}`
    throw redirect(circularURL)
  }
}

async function* getAllRecords(): AsyncGenerator<Circular[], void, unknown> {
  const data = await tables()
  let exclusiveStartKey: AWS.DynamoDB.DocumentClient.Key | undefined = undefined

  do {
    const params: AWS.DynamoDB.DocumentClient.ScanInput = {
      TableName: 'circulars',
      ExclusiveStartKey: exclusiveStartKey,
    }

    const { Items, LastEvaluatedKey } = await data.circulars.scan(params)

    if (Items) {
      yield Items as Circular[]
    }

    exclusiveStartKey = LastEvaluatedKey
  } while (exclusiveStartKey)

  return
}

export async function makeTarFile(fileType: string): Promise<ReadableStream> {
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
          { name: `gcn-circulars/${circular.circularId}.txt` },
          formatCircular(circular)
        )
        txt_entry.end()
      } else if (fileType === 'json') {
        const json_entry = pack.entry(
          { name: `gcn-circulars/${circular.circularId}.json` },
          JSON.stringify(circular, null, 2)
        )
        json_entry.end()
      }
    }
  }

  pack.finalize()

  return createReadableStreamFromReadable(Readable.from(tarStream))
}
