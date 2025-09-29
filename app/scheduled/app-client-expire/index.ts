/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import { type DynamoDBDocument, paginateScan } from '@aws-sdk/lib-dynamodb'
import partition from 'lodash/partition'
import { dedent } from 'ts-dedent'

import { EXPIRATION_MILLIS, WARNING_MILLIS } from '~/lib/cognito'
import {
  deleteAppClient,
  extractAttribute,
  getCognitoUserFromSub,
} from '~/lib/cognito.server'
import { sendEmail } from '~/lib/email.server'
import { feature, origin } from '~/lib/env.server'

type CredentialInfo = {
  sub: string
  name: string
  client_id: string
  created: number
  lastUsed?: number
}

export async function handler() {
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument
  const TableName = db.name('client_credentials')

  const expirationDate = new Date().getTime()
  const deletionCutoff = expirationDate - EXPIRATION_MILLIS
  const warningCutoff = expirationDate - WARNING_MILLIS

  const expiredAndWarningCredentials = paginateScan(
    {
      client,
    },
    {
      FilterExpression:
        'attribute_not_exists(expired) and (lastUsed < :warningCutoff or (attribute_not_exists(lastUsed) and created < :warningCutoff))',
      TableName,
      ExpressionAttributeValues: {
        ':warningCutoff': warningCutoff,
      },
    }
  )

  const expiredCreds: CredentialInfo[] = []
  const warningCreds: CredentialInfo[] = []
  const subs = []
  for await (const { Items } of expiredAndWarningCredentials) {
    if (Items) {
      const creds = Items as CredentialInfo[]
      const [moreExpiredCreds, moreWarningCreds] = partition(
        creds,
        (cred) => (cred.lastUsed ?? cred.created) < deletionCutoff
      )
      if (feature('APP_CLIENT_TRACKING')) {
        expiredCreds.push(...moreExpiredCreds)
        warningCreds.push(...moreWarningCreds)
      } else {
        // Put both expired and warning together for the first few iterations of the scheduled task
        warningCreds.push(...moreWarningCreds, ...moreExpiredCreds)
      }
      subs.push(...creds.map((cred) => cred.sub))
    }
  }

  const uniqueSubs = [...new Set(subs)]
  const userEmailMap: { [key: string]: string } = Object.fromEntries(
    await Promise.all(
      uniqueSubs.map(async (sub) => {
        let user
        try {
          user = await getCognitoUserFromSub(sub)
        } catch (e) {
          if (e instanceof Response) {
            console.log('Error, user may not exist: ', sub)
          } else {
            throw e
          }
        }
        return [sub, extractAttribute(user?.Attributes, 'email')]
      })
    )
  )

  const expirationEmailPromises = expiredCreds
    .filter((cred) => userEmailMap[cred.sub] !== undefined)
    .map((cred) =>
      sendEmail({
        to: [userEmailMap[cred.sub]],
        fromName: 'GCN Kafka Service',
        subject: 'Client Credential Deleted',
        body: `Your Kafka client credential "${cred.name}" has expired. For more information about our credential expiration policy, please visit ${origin}/docs/internal/auth or ${origin}/contact for support.`,
      })
    )

  const warningEmailPromises = warningCreds
    .filter((cred) => userEmailMap[cred.sub] !== undefined)
    .map((cred) =>
      sendEmail({
        to: [userEmailMap[cred.sub]],
        fromName: 'GCN Kafka Service',
        subject: 'GCN Kafka Client Credentials Expiring Soon',
        body: dedent`
        Your GCN client credential named "${cred.name}" has not been used recently and will expire in the next few days.

        For security purposes, we disable client credentials that you have not used to connect to a Kafka broker for the past 30 days. Once disabled, a client credential cannot be used again. To prevent a credential from expiring and being disabled, simply use it to connect to a Kafka broker. You may create new client credentials at any time. For more information on this policy, see our documentation at ${origin}/docs/faq#why-are-my-kafka-client-credentials-expiring.

        No actions are needed on your end. You can review your client credentials at ${origin}/user/credentials or visit ${origin}/contact for questions and support.
      `,
      })
    )

  await Promise.all([
    // Mark as expired in DynamoDB
    ...expiredCreds.map((cred) =>
      db.client_credentials.update({
        Key: { sub: cred.sub, client_id: cred.client_id },
        UpdateExpression: 'SET expired = :expired',
        ExpressionAttributeValues: {
          ':expired': expirationDate,
        },
      })
    ),
    // Delete App clients from Cognito
    ...expiredCreds.map((cred) => deleteAppClient(cred.client_id)),
    // Send emails
    ...expirationEmailPromises,
    ...warningEmailPromises,
  ])
}
