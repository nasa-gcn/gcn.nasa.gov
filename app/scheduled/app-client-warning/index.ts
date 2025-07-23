/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import dedent from 'ts-dedent'

import {
  extractAttributeRequired,
  getCognitoUserFromSub,
} from '~/lib/cognito.server'
import { sendEmailBulk } from '~/lib/email.server'
import { origin } from '~/lib/env.server'
import type { RedactedClientCredential } from '~/routes/user.credentials/client_credentials.server'

export async function handler() {
  const db = await tables()
  const date = new Date() // 20th of the month
  date.setDate(date.getDate() + 7) // 27th upcoming deletion date
  const deletionCutoff = date.setMonth(date.getMonth() - 1) // Last month's deletion date

  const expiredCredentials = (
    await db.client_credentials.query({
      FilterExpression: 'lastUsed < :deletionCutoff',
      ExpressionAttributeValues: {
        ':deletionCutoff': deletionCutoff,
      },
    })
  ).Items as ({ sub: string } & RedactedClientCredential)[]

  const emails: string[] = []
  for (const credential of expiredCredentials) {
    emails.push(
      extractAttributeRequired(
        (await getCognitoUserFromSub(credential.sub)).Attributes,
        'email'
      )
    )
  }
  await sendEmailBulk({
    fromName: 'GCN Kafka Service',
    to: emails,
    subject: 'Client Credential Expiration Notice',
    body: dedent`
    You are receiving this email because one or more of your existing client credentials will expire from disuse on the 27th of this month. 
    
    Expired credentials will be deleted as part of our updated security practices on the 27th. For more information on this policy, see our documentation at ${origin}/docs/internal/auth.
    
    No actions are needed on your end, however, if you would like to review your credentials you can do so at ${origin}/user/credentials.
    `,
    topic: 'clientCredentials',
  })
}
