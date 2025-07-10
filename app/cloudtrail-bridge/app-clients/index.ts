/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import type { EventBridgeEvent } from 'aws-lambda'

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
  const eventName = event.detail.eventName
  if (eventName !== 'Token_POST') return
  const client_id = event.detail.additionalEventData.clientId
  if (!client_id) throw new Error('client_id is not present')
  const { Items } = await db.client_credentials.query({
    IndexName: 'credentialsByClientId',
    KeyConditionExpression: 'client_id = :client_id',
    ExpressionAttributeValues: {
      ':client_id': client_id,
    },
  })
  const credential = Items[0]
  await db.client_credentials.update({
    Key: { sub: credential.sub, client_id },
    UpdateExpression: 'set #lastAccessed = :lastAccessed',
    ExpressionAttributeNames: {
      '#lastAccessed': 'lastAccessed',
    },
    ExpressionAttributeValues: {
      ':lastAccessed': event.detail.eventTime,
    },
  })
}
