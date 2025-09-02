/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { paginateQuery } from '@aws-sdk/lib-dynamodb'
import partition from 'lodash/partition'
import dedent from 'ts-dedent'

import { EXPIRATION_MILLIS, WARNING_MILLIS } from '~/lib/cognito'
import {
  deleteAppClient,
  extractAttributeRequired,
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
  if (!feature('APP_CLIENT_TRACKING')) return
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument
  const TableName = db.name('client_credentials')

  const expirationDate = new Date().getTime()
  const deletionCutoff = expirationDate - EXPIRATION_MILLIS
  const warningCutoff = expirationDate - WARNING_MILLIS

  const expiredAndWarningCredentials = paginateQuery(
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
      ExpressionAttributeNames: {
        '#sub': 'sub',
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
      expiredCreds.push(...moreExpiredCreds)
      warningCreds.push(...moreWarningCreds)
      subs.push(...creds.map((cred) => cred.sub))
    }
  }
  const uniqueSubs = [...new Set(subs)]
  const userEmailMap: { [key: string]: string } = Object.fromEntries(
    await Promise.all(
      uniqueSubs.map(async (sub) => [
        sub,
        extractAttributeRequired(
          (await getCognitoUserFromSub(sub)).Attributes,
          'email'
        ),
      ])
    )
  )

  const expirationEmailPromises = expiredCreds.map((cred) =>
    sendEmail({
      to: [userEmailMap[cred.sub]],
      fromName: 'GCN Kafka Service',
      subject: 'Client Credential Deleted',
      body: `Your Kafka client credential "${cred.name}" has expired. For more information about our credential expiration policy, please visit ${origin}/docs/internal/auth or ${origin}/contact for support.`,
    })
  )

  const warningEmailPromises = warningCreds.map((cred) =>
    sendEmail({
      to: [userEmailMap[cred.sub]],
      fromName: 'GCN Kafka Service',
      subject: 'GCN Kafka Client Credentials Expiring Soon',
      body: dedent`
      GCN has updated our security practices to disable disused Kafka client credentials.
      
      Your client credentials, "${cred.name}", for connecting to the GCN Kafka brokers has not been used recently and is set to expire within the next few days. For more information on this policy, see our documentation at ${origin}/docs/faq#why-are-my-kafka-client-credentials-expiring.
      
      This will NOT delete or disable your account, and you can sign on to create new credentials in the future, should you need them.
      
      No actions are needed on your end. You can review your client credentials at ${origin}/user/credentials.

      For support, please visit ${origin}/contact.
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
