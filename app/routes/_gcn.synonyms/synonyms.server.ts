/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'

export async function createSynonyms({ synonyms }: { synonyms: string[] }) {
  const synonymId = crypto.randomUUID()
  const db = await tables()
  await Promise.all(
    synonyms.map((eventId) => {
      if (!eventId) return null
      return db.synonyms.put({ synonymId, eventId })
    })
  )
  return synonymId
}
