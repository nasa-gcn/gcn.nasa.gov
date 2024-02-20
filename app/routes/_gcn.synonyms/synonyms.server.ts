/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import crypto from 'crypto'

/*
If an eventId already has a synonym and is passed in, it will unlink the
eventId from the old synonym and the only remaining link will be to the
new synonym
*/
export async function createSynonyms(...synonymousEventIds: string[]){
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
