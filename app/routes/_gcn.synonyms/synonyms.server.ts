/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'

import type { Synonym } from './synonyms.lib'

export async function getBySynonymId({
  synonymId,
}: {
  synonymId: string
}): Promise<Synonym[]> {
  const db = await tables()
  const params = {
    TableName: 'synonyms',
    IndexName: 'synonymsById',
    KeyConditionExpression: 'synonymId = :synonymId',
    ExpressionAttributeValues: {
      ':synonymId': synonymId,
    },
  }
  const result = await db.synonyms.query(params)

  if (result.Items) {
    const synonyms: Synonym[] = result.Items as Synonym[]
    return synonyms
  } else {
    return [] as Synonym[]
  }
}

export async function putSynonyms({
  synonymId,
  synonyms,
  deleteSynonyms,
}: {
  synonymId: string
  synonyms?: string[]
  deleteSynonyms?: string[]
}) {
  const db = await tables()
  synonyms = synonyms?.filter((n) => n)
  deleteSynonyms = deleteSynonyms?.filter((n) => n)
  if (!synonyms || !deleteSynonyms) {
    return await db.synonyms.get({ synonymId })
  }
  const subtractions = deleteSynonyms.filter((x) => !synonyms?.includes(x))
  const additions = synonyms.filter((x) => !deleteSynonyms?.includes(x))

  if (!subtractions && !additions) return
  if (subtractions) {
    await Promise.all(
      subtractions.map((eventId) => {
        return db.synonyms.delete({ eventId, synonymId })
      })
    )
  }
  if (additions) {
    await Promise.all(
      additions.map((eventId) => {
        return db.synonyms.put({ synonymId, eventId })
      })
    )
  }
}

export async function deleteSynonyms({ synonymId }: { synonymId: string }) {
  if (!synonymId) return
  const db = await tables()
  const results = await db.synonyms.query({
    IndexName: 'synonymsById',
    KeyConditionExpression: 'synonymId = :synonymId',
    ExpressionAttributeValues: {
      ':synonymId': synonymId,
    },
  })
  for (const item of results.Items) {
    await db.synonyms.delete({
      eventId: item.eventId,
      synonymId: item.synonymId,
    })
  }
}
