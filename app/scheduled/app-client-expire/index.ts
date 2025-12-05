/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import { type DynamoDBDocument, paginateScan } from '@aws-sdk/lib-dynamodb'
import groupBy from 'lodash/groupBy.js'
import partition from 'lodash/partition'
import pThrottle from 'p-throttle'
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

// Cognito API calls have severe rate limits.
// Throttle the rate of requests to at most 1/3 of their rate limit.
// See https://docs.aws.amazon.com/cognito/latest/developerguide/quotas.html.
const throttledGetCognitoUserFromSub = pThrottle({ interval: 1000, limit: 10 })(
  getCognitoUserFromSub
)
const throttledDeleteAppClient = pThrottle({ interval: 1000, limit: 5 })(
  deleteAppClient
)

async function getEmailForSub(sub: string) {
  let user
  try {
    user = await throttledGetCognitoUserFromSub(sub)
  } catch (e) {
    if (e instanceof Response) {
      console.error('user does not exist: ', sub)
    } else {
      throw e
    }
  }
  return extractAttribute(user?.Attributes, 'email')
}

export async function handler() {
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument
  const TableName = db.name('client_credentials')

  const expirationDate = new Date().getTime()
  const deletionCutoff = expirationDate - EXPIRATION_MILLIS
  const warningCutoff = expirationDate - WARNING_MILLIS

  const credentials: CredentialInfo[] = []
  for await (const { Items } of paginateScan(
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
  )) {
    if (Items) credentials.push(...(Items as CredentialInfo[]))
  }

  await Promise.all(
    Object.entries(groupBy(credentials, ({ sub }) => sub)).map(
      async ([sub, credentialsForSub]) => {
        const email = await getEmailForSub(sub)
        if (email) {
          const [expired, expiringSoon] = partition(
            credentialsForSub,
            ({ lastUsed, created }) =>
              feature('APP_CLIENT_TRACKING') &&
              (lastUsed ?? created) < deletionCutoff
          )

          await Promise.all([
            ...expired.flatMap(({ name, sub, client_id }) => [
              db.client_credentials.update({
                Key: { sub, client_id },
                UpdateExpression: 'SET expired = :expired',
                ExpressionAttributeValues: {
                  ':expired': expirationDate,
                },
              }),
              throttledDeleteAppClient(client_id),
              sendEmail({
                to: [email],
                fromName: 'GCN Kafka Service',
                subject: 'Client Credential Deleted',
                body: `Your Kafka client credential "${name}" has expired. For more information about our credential expiration policy, please visit ${origin}/docs/internal/auth or ${origin}/contact for support.`,
              }),
            ]),
            ...expiringSoon.map(({ name }) =>
              sendEmail({
                to: [email],
                fromName: 'GCN Kafka Service',
                subject: 'GCN Kafka Client Credentials Expiring Soon',
                body: dedent`
                Your GCN client credential named "${name}" has not been used recently and will expire in the next few days.

                For security purposes, we disable client credentials that you have not used to connect to a Kafka broker for the past 30 days. Once disabled, a client credential cannot be used again. To prevent a credential from expiring and being disabled, simply use it to connect to a Kafka broker. You may create new client credentials at any time. For more information on this policy, see our documentation at ${origin}/docs/faq#why-are-my-kafka-client-credentials-expiring.

                No actions are needed on your end. You can review your client credentials at ${origin}/user/credentials or visit ${origin}/contact for questions and support.
              `,
              })
            ),
          ])
        }
      }
    )
  )
}
