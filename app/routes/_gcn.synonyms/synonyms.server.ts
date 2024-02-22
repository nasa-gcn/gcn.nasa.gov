/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb/dist-types/DynamoDBDocument'
import crypto from 'crypto'

/*
 * If an eventId already has a synonym and is passed in, it will unlink the
 * eventId from the old synonym and the only remaining link will be to the
 * new synonym.
 *
 * BatchWriteItem has a limit of 25 items, so the user may not add more than
 * 25 synonyms at a time.
 */
export async function createSynonyms(...synonymousEventIds: string[]) {
  const uuid = crypto.randomUUID()
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument

  const writeRequests = synonymousEventIds
    .filter((eventId) => Boolean(eventId))
    .map((eventId) => ({
      PutRequest: {
        Item: { uuid, eventId },
      },
    }))

  const params = {
    RequestItems: {
      synonyms: writeRequests,
    },
  }

  await client.batchWrite(params)

  return uuid
}
