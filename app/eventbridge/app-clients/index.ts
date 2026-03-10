/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import type { EventBridgeEvent } from 'aws-lambda'
import invariant from 'tiny-invariant'

type UserIdentity = {
  type: string
  accountId: string
}

type ResponseParameters = {
  status: number
}

type RequestParameters = {
  grant_type: string[]
}

type AdditionalEventData = {
  responseParameters: ResponseParameters
  clientId: string
  requestParameters: RequestParameters
  userPoolDomain: string
  userPoolId: string
}

type ServiceEventDetails = {
  serviceAccountId: string
}

type TlsDetails = {
  tlsVersion: string
  cipherSuite: string
  clientProvidedHostHeader: string
}
type EventDetail = {
  eventVersion: string
  userIdentity: UserIdentity
  eventTime: string
  eventSource: string
  eventName: string
  awsRegion: string
  sourceIPAddress: string
  userAgent: string
  requestParameters?: any
  responseElements?: any
  additionalEventData: AdditionalEventData
  requestID: string
  eventID: string
  readOnly: boolean
  eventType: string
  managementEvent: boolean
  recipientAccountId: string
  serviceEventDetails: ServiceEventDetails
  eventCategory: string
  tlsDetails: TlsDetails
}

export async function handler(
  event: EventBridgeEvent<'AWS Service Event via CloudTrail', EventDetail>
) {
  const db = await tables()
  const client_id = event.detail.additionalEventData.clientId
  invariant(client_id)
  const {
    Items: [{ sub }],
  } = await db.client_credentials.query({
    IndexName: 'credentialsByClientId',
    KeyConditionExpression: 'client_id = :client_id',
    ExpressionAttributeValues: {
      ':client_id': client_id,
    },
  })
  await db.client_credentials.update({
    Key: { sub, client_id },
    UpdateExpression:
      'set #lastUsed = :lastUsed, #countUsed = if_not_exists(#countUsed, :countUsedDefault) + :countUsedIncrement',
    ExpressionAttributeNames: {
      '#lastUsed': 'lastUsed',
      '#countUsed': 'countUsed',
    },
    ExpressionAttributeValues: {
      ':lastUsed': Date.parse(event.detail.eventTime),
      ':countUsedIncrement': 1,
      ':countUsedDefault': 0,
    },
  })
}
