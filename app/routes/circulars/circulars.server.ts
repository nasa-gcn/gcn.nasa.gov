/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import type { DynamoDB } from '@aws-sdk/client-dynamodb'
import { type DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { DynamoDBAutoIncrement } from '@nasa-gcn/dynamodb-autoincrement'
import { redirect } from '@remix-run/node'
import memoizee from 'memoizee'

import type { User } from '../_auth/user.server'
import { getUser } from '../_auth/user.server'
import { bodyIsValid, formatAuthor, subjectIsValid } from './circulars.lib'
import type {
  Circular,
  CircularMetadata,
  RevisionRequest,
} from './circulars.lib'
import { search as getSearch } from '~/lib/search.server'

// A type with certain keys required.
type Require<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

export const group = 'gcn.nasa.gov/circular-submitter'
export const moderatorGroup = 'gcn.nasa.gov/circular-moderator'

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
      tableName,
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

/** Get an old version of a circular by circular ID and versionId. */
export async function getCircularVersion(
  circularId: number,
  version: number
): Promise<Circular> {
  if (isNaN(circularId) || isNaN(version))
    throw new Response(null, { status: 404 })
  const db = await tables()
  const result = await db.circulars_history.get({
    circularId,
    version,
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

export async function putDeprecatedVersion(
  circular: Omit<Circular, 'createdOn' | 'submitter'>,
  request: Request
) {
  const user = await getUser(request)
  if (!user?.groups.includes(group))
    throw new Response('User is not in the submitters group', {
      status: 403,
    })

  if (!subjectIsValid(circular.subject))
    throw new Response('subject is invalid', { status: 400 })
  if (!bodyIsValid(circular.body))
    throw new Response('body is invalid', { status: 400 })

  // Create a copy of the old version
  const existingCircular = await createCircularHistory(circular.circularId)

  await updateCircular(
    circular.circularId,
    circular.body,
    circular.subject,
    user,
    existingCircular.version
  )
}

/**
 *
 * @param circularId
 * @returns an array of previous Circulars sorted by descending version
 */
export async function getCircularHistory(
  circularId: number
): Promise<Circular[]> {
  const db = await tables()
  const result = await db.circulars_history.query({
    KeyConditionExpression: 'circularId = :circularId',
    ExpressionAttributeValues: {
      ':circularId': circularId,
    },
    ScanIndexForward: false,
  })
  return result.Items as Circular[]
}

export async function putChangeRequest(
  circularId: number,
  body: string,
  subject: string,
  request: Request
) {
  const user = await getUser(request)
  if (!user)
    throw new Response('User is not signed in', {
      status: 403,
    })
  const requestor = formatAuthor(user)
  const db = await tables()
  await db.circulars_requested_edits.put({
    circularId,
    body,
    subject,
    requestor,
  })
}

export async function approveChangeRequest(
  circularId: number,
  requestor: string,
  request: Request
) {
  const user = await getUser(request)
  if (!user)
    throw new Response('User is not signed in', {
      status: 403,
    })

  if (!user.groups.includes(moderatorGroup))
    throw new Response('User is not in the moderators group', {
      status: 403,
    })

  const db = await tables()
  const requestedEdits = (await db.circulars_requested_edits.get({
    circularId,
    requestor,
  })) as RevisionRequest

  const existingCircular = await createCircularHistory(circularId)

  await updateCircular(
    circularId,
    requestedEdits.body,
    requestedEdits.subject,
    user,
    existingCircular.version
  )
}

async function createCircularHistory(
  circularId: number
): Promise<Require<Circular, 'version'>> {
  const existingCircular = await get(circularId)
  const db = await tables()
  if (!existingCircular.version) {
    existingCircular.version = 1
  }
  await db.circulars_history.put({
    ...existingCircular,
  })
  return existingCircular as Require<Circular, 'version'>
}

async function updateCircular(
  circularId: number,
  body: string,
  subject: string,
  user: User,
  version: number
) {
  const db = await tables()
  await db.circulars.update({
    Key: { circularId },
    UpdateExpression:
      'set body = :body, subject = :subject, editedBy = :editedBy, createdOn = :createdOn, version = :version',
    ExpressionAttributeValues: {
      ':body': body,
      ':subject': subject,
      ':editedBy': formatAuthor(user),
      ':createdOn': Date.now(),
      ':version': version + 1,
    },
  })
}
