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
import natsort from 'natsort'

import { getUser } from '../_auth/user.server'
import {
  bodyIsValid,
  formatAuthor,
  parseEventFromSubject,
  subjectIsValid,
} from './circulars.lib'
import type {
  Circular,
  CircularGroupMetadata,
  CircularMetadata,
} from './circulars.lib'
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
      tableName,
      tableAttributeName: 'circularId',
      initialValue: 1,
      dangerously,
    })
  },
  { promise: true }
)

export async function syncSynonyms({ synonyms }: { synonyms: string[] }) {
  const db = await tables()
  const doc = db._doc as unknown as DynamoDBDocument

  const tableName = db.name('synonyms')

  return doc.put({
    TableName: tableName,
    Item: {
      synonyms,
    },
  })
}

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
  hasNextPage?: boolean
  afterKey?: object
  page: number
}> {
  const client = await getSearch()

  const [startTime, endTime] = getValidDates(startDate, endDate)

  const esQuery = query
    ? {
        function_score: {
          query: {
            bool: {
              must: [
                {
                  query_string: {
                    query: `*${query}*`,
                    fields: [
                      'eventId^4',
                      'synonyms^3',
                      'subject^2',
                      'body^1',
                      'submitter',
                    ],
                    fuzzy_max_expansions: 50,
                  },
                },
                {
                  range: {
                    createdOn: {
                      gte: startTime,
                      lte: endTime,
                    },
                  },
                },
              ],
            },
          },
          functions: [
            {
              filter: { exists: { field: 'eventId' } },
              weight: 4,
            },
            {
              filter: { exists: { field: 'synonyms' } },
              weight: 3,
            },
            {
              filter: { exists: { field: 'subject' } },
              weight: 2,
            },
            {
              filter: { exists: { field: 'body' } },
              weight: 1,
            },
          ],
          score_mode: 'sum',
          boost_mode: 'sum',
        },
      }
    : {
        match_all: {},
      }

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
      query: esQuery,
      fields: ['subject'],
      _source: false,
      sort: {
        _score: 'desc',
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
  const currentPage = page || 1
  return { items, totalPages, totalItems, page: currentPage }
}

export async function getUniqueSynonymsArrays({
  limit = 10,
  page,
  eventId,
}: {
  limit?: number
  page: number
  eventId?: string
}): Promise<{
  synonyms: string[][]
  totalItems: number
  totalPages: number
  page: number
}> {
  const client = await getSearch()
  const from = (page - 1) * limit
  const {
    body: {
      hits: {
        total: { value: totalItems },
        hits,
      },
    },
  } = await client.search({
    index: 'synonyms',
    from,
    size: limit,
    body: {
      query: {
        bool: {
          must: eventId
            ? {
                match: {
                  id: `*${eventId}*`,
                },
              }
            : { match_all: {} },
        },
      },
    },
  })

  const totalPages: number = Math.ceil(totalItems / limit)
  const items = hits.map(
    ({ _id: id }: { _id: string; fields: { id: string } }) =>
      id.split(',').map((s) => s.trim())
  )

  return {
    synonyms: items,
    totalItems,
    totalPages,
    page,
  }
}

export async function getCircularsGroupedBySynonyms({
  synonyms,
  limit = 10,
}: {
  synonyms?: string[][]
  limit?: number
}): Promise<{
  totalPages: number
  results: CircularGroupMetadata
}> {
  if (!synonyms) {
    return {
      totalPages: 0,
      results: {} as CircularGroupMetadata,
    }
  }
  const client = await getSearch()

  const shouldClauses = synonyms.map((synonym) => ({
    terms: { 'synonyms.keyword': synonym },
  }))
  const query = {
    index: 'circulars',
    body: {
      size: limit,
      query: {
        bool: {
          should: shouldClauses,
        },
      },
      aggs: {
        synonyms_group: {
          terms: {
            field: 'synonyms.keyword',
            size: 100,
          },
          aggs: {
            circulars: {
              top_hits: {
                size: 100,
              },
            },
          },
        },
      },
    },
  }

  const response = await client.search(query)

  const {
    body: {
      aggregations: {
        synonyms_group: { buckets },
      },
      hits: { total },
    },
  } = response

  await client.close()

  const totalPages = Math.ceil(total.value / limit)

  const results = buckets.map((bucket: any) => {
    const synonym = bucket.key
    const circulars = bucket.circulars.hits.hits.map(
      (hit: any) => hit._source
    ) as Circular[]
    return {
      id: synonym,
      circulars,
    }
  })
  const groupResult = { groups: results } as CircularGroupMetadata

  return {
    totalPages,
    results: groupResult,
  }
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
  if (item.synonyms) syncSynonyms({ synonyms: item.synonyms })
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
  const eventId = parseEventFromSubject(item.subject)
  const synonyms = eventId ? [eventId] : []

  return await putRaw({
    sub: user.sub,
    submitter: formatAuthor(user),
    eventId,
    synonyms,
    ...item,
  })
}

function formatSynonyms(synonyms?: string[]) {
  if (!synonyms) return []
  const strippedStrings = synonyms.map((x) => {
    return x.trim()
  })
  return strippedStrings.sort(natsort({ insensitive: true }))
}

export async function updateEventData({
  circularId,
  eventId,
  synonyms,
}: {
  circularId: number
  eventId?: string
  synonyms?: string[]
}) {
  const db = await tables()
  let synonymsList = synonyms || []
  if (!eventId && !synonyms) {
    return await db.circulars.get({ circularId })
  }
  if (eventId && synonyms?.length == 0) {
    synonymsList = [eventId]
  }
  if (eventId && !synonyms?.includes(eventId)) {
    synonymsList.push(eventId)
  }
  await db.circulars.update({
    Key: { circularId },
    UpdateExpression: 'set #eventId = :eventId, #synonyms = :synonyms',
    ExpressionAttributeNames: {
      '#eventId': 'eventId',
      '#synonyms': 'synonyms',
    },
    ExpressionAttributeValues: {
      ':eventId': eventId,
      ':synonyms': formatSynonyms(synonymsList),
    },
  })
  return await db.circulars.get({ circularId })
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
