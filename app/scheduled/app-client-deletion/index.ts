/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'

import {
  deleteAppClient,
  extractAttributeRequired,
  getCognitoUserFromSub,
} from '~/lib/cognito.server'
import { sendEmail } from '~/lib/email.server'
import { origin } from '~/lib/env.server'
import type { RedactedClientCredential } from '~/routes/user.credentials/client_credentials.server'

export async function handler() {
  const db = await tables()
  const date = new Date() // 27th of the month
  const deletionCutoff = date.setMonth(date.getMonth() - 1) // Last month's deletion date

  const expiredCredentials = (
    await db.client_credentials.query({
      FilterExpression: 'lastUsed < :deletionCutoff',
      ExpressionAttributeValues: {
        ':deletionCutoff': deletionCutoff,
      },
    })
  ).Items as ({ sub: string } & RedactedClientCredential)[]

  const dbDeletionPromises = expiredCredentials.map((cred) =>
    db.client_credentials.delete({ sub: cred.sub, client_id: cred.client_id })
  )

  const appClientsDeletions = expiredCredentials.map((cred) =>
    deleteAppClient(cred.client_id)
  )

  await Promise.all([...dbDeletionPromises, ...appClientsDeletions])

  const usersMap: { [key: string]: string } = {}
  for (const credential of expiredCredentials) {
    const userEmail = extractAttributeRequired(
      (await getCognitoUserFromSub(credential.sub)).Attributes,
      'email'
    )
    usersMap[credential.name] = userEmail
  }

  const emailPromises = expiredCredentials.map((cred) =>
    sendEmail({
      to: [usersMap[cred.name]],
      fromName: 'GCN Kafka Service',
      subject: 'Client Credential Deletion',
      body: `Your client credential "${cred.name}" has been deleted. For more information about our credential deletion policy, please visit ${origin}/docs/internal/auth.`,
    })
  )

  await Promise.all(emailPromises)
}
