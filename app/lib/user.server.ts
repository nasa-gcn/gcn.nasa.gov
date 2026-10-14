/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'

export type UserMetadata = {
  sub: string
  email: string
  username?: string
  affiliation?: string
  validEmails: EmailItem[]
}

export type EmailItem = {
  address: string
  verified: boolean
}

export async function getValidEmails(sub: string) {
  const db = await tables()
  return ((await db.users.get({ sub })) as UserMetadata).validEmails.filter(
    (x) => x.verified
  )
}
