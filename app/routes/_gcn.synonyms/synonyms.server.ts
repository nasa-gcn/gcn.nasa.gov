/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import crypto from 'crypto'

export async function createSynonyms({
  synonymousEventIds,
}: {
  synonymousEventIds: string[]
}) {
  const uuid = crypto.randomUUID()
  const db = await tables()
  await Promise.all(
    synonymousEventIds.map((eventId) => {
      if (!eventId) return null
      return db.synonyms.put({ uuid, eventId })
    })
  )
  return uuid
}
