/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'

import { getEnvOrDie } from '~/lib/env.server'

const adsToken = getEnvOrDie('ADS_TOKEN')

async function* getAdsEntries() {
  const url = new URL('https://api.adsabs.harvard.edu/v1/search/query')
  url.searchParams.set('q', 'bibstem:GCN')
  url.searchParams.set('fl', 'bibcode,volume')
  url.searchParams.set('sort', 'bibcode asc')
  url.searchParams.set('rows', '2000')
  let start = 0
  let length

  let items: { bibcode: string; volume: string }[]
  do {
    const result = await fetch(url, {
      headers: { Authorization: `Bearer ${adsToken}` },
    })
    if (!result.ok)
      throw new Error(`${url.toString()} returned HTTP status ${result.status}`)

    items = (await result.json()).response.docs
    length = items.length
    start += length
    url.searchParams.set('start', start.toString())

    yield items.map(({ bibcode, volume }) => ({
      bibcode,
      circularId: Number(volume.replace('a', '.5')),
    }))
  } while (length)
}

export async function handler() {
  const db = await tables()
  const seenCircularIds = new Set<number>()
  for await (const entries of getAdsEntries()) {
    await Promise.all(
      entries
        .filter(({ circularId }) => {
          // Filter out duplicate entries for the same circular ID;
          // prefer the chronologically earlier entries which are also entries
          // with lexically least value of bibcode
          const result = !seenCircularIds.has(circularId)
          seenCircularIds.add(circularId)
          return result
        })
        .map(async ({ bibcode, circularId }) => {
          try {
            await db.circulars.update({
              ConditionExpression: 'attribute_exists(circularId)',
              ExpressionAttributeValues: {
                ':bibcode': bibcode,
              },
              Key: { circularId },
              UpdateExpression: 'set bibcode = :bibcode',
            })
          } catch (e) {
            if (e instanceof ConditionalCheckFailedException) {
              console.error(
                `Attempted to update Circular ${circularId}, which does not exist in DynamoDB`
              )
            } else {
              throw e
            }
          }
        })
    )
  }
}
