/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import memoizee from 'memoizee'
import { Issuer } from 'openid-client'

import { getEnvOrDie } from './env.server'
import { getBearerAuthHeaders } from './headers.server'
import { throwForStatus } from './utils'

interface ZendeskRequest {
  requester: Requester
  subject: string
  comment: RequestComment
}

interface Requester {
  email: string
  name: string
}

interface RequestComment {
  body: string
}

const zendeskDomain = 'https://nasa-gcn.zendesk.com'

const getAccessToken = memoizee(
  async () => {
    const issuer = new Issuer({
      issuer: zendeskDomain,
      token_endpoint: `${zendeskDomain}/oauth/tokens`,
      token_endpoint_auth_methods_supported: ['client_secret_post'],
    })
    const client = new issuer.Client({
      client_id: getEnvOrDie('ZENDESK_CLIENT_ID'),
      client_secret: getEnvOrDie('ZENDESK_CLIENT_SECRET'),
    })
    const { access_token } = await client.grant({
      grant_type: 'client_credentials',
      scope: 'requests:write tickets:write',
    })
    if (!access_token) {
      throw new Error('response must contain access_token')
    }
    return access_token
  },
  { promise: true }
)

async function fetchZendesk(url: string | URL, method: string, body: any) {
  const accessToken = await getAccessToken()
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getBearerAuthHeaders(accessToken),
    },
    body: JSON.stringify(body),
  })
  throwForStatus(response)
  return response
}

export async function postZendeskRequest(request: ZendeskRequest) {
  const response = await fetchZendesk(
    `${zendeskDomain}/api/v2/requests`,
    'POST',
    { request }
  )
  const responseJson = await response.json()
  if (!responseJson.request.id) {
    throw new Error(
      'ZenDesk request succeeded, but did not return a request ID',
      { cause: responseJson }
    )
  }
  return responseJson.request.id
}

export async function closeZendeskTicket(ticketId: number) {
  await fetchZendesk(`${zendeskDomain}/api/v2/tickets/${ticketId}`, 'PUT', {
    ticket: {
      status: 'solved',
    },
  })
}
