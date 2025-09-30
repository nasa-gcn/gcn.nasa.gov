/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import {
  CreateUserPoolClientCommand,
  DeleteUserPoolClientCommand,
  DescribeUserPoolClientCommand,
  ListGroupsCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-cognito-identity-provider'
import { generators } from 'openid-client'

import { cognito, maybeThrowCognito } from '~/lib/cognito.server'
import { getUser } from '~/routes/_auth/user.server'

export interface RedactedClientCredential {
  name: string
  client_id: string
  scope: string
  created: number
  lastUsed?: number
  expired?: number
  countUsed?: number
}

export interface ClientCredential extends RedactedClientCredential {
  client_secret?: string
}

export interface UnRedactedClientCredential extends RedactedClientCredential {
  client_secret: string
}

export const defaultGroup = 'gcn.nasa.gov/kafka-public-consumer'

export class ClientCredentialVendingMachine {
  #sub: string
  #groups: string[]

  private constructor(sub: string, groups: string[]) {
    this.#sub = sub
    this.#groups = groups
  }

  static async create(request: Request) {
    const user = await getUser(request)
    if (!user) throw new Response('not signed in', { status: 403 })
    return new this(
      user.sub,
      user.groups.filter((x) => x.startsWith('gcn.nasa.gov/kafka'))
    )
  }

  get groups() {
    return this.#groups
  }

  async getClientCredentials() {
    const db = await tables()
    const results = await db.client_credentials.query({
      KeyConditionExpression: '#sub = :sub',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#scope': 'scope',
        '#sub': 'sub',
      },
      ExpressionAttributeValues: {
        ':sub': this.#sub,
      },
      ProjectionExpression:
        'client_id, #name, #scope, created, lastUsed, countUsed, expired',
    })
    const credentials = results.Items as RedactedClientCredential[]
    credentials.sort((a, b) => a.created - b.created)
    return credentials
  }

  async getClientCredential(
    client_id: string
  ): Promise<UnRedactedClientCredential> {
    const db = await tables()

    // Make sure that the user actually owns the given client ID before
    // we try to get its client secret
    const item = (await db.client_credentials.get({
      sub: this.#sub,
      client_id,
    })) as ({ sub: string } & RedactedClientCredential) | null
    if (!item) throw new Response(null, { status: 404 })

    const { sub, ...client_credential } = item
    const client_secret = await this.#getClientSecretInternal(client_id)

    return {
      client_secret,
      ...client_credential,
    }
  }

  async deleteClientCredential(client_id: string) {
    const db = await tables()

    // Make sure that the user actually owns the given client ID before
    // we try to delete it
    const item = await db.client_credentials.get({
      sub: this.#sub,
      client_id,
    })
    if (!item) throw new Response(null, { status: 404 })

    await Promise.all([
      this.#deleteClientCredentialInternal(client_id),
      db.client_credentials.delete({ sub: this.#sub, client_id }),
    ])
  }

  async createClientCredential(
    name?: string,
    scope?: string
  ): Promise<UnRedactedClientCredential> {
    if (!name) throw new Response('name must not be empty', { status: 400 })
    if (!scope) throw new Response('scope must not be empty', { status: 400 })
    if (!this.#groups.includes(scope))
      throw new Response('user does not belong to the requested group', {
        status: 403,
      })

    const { client_id, client_secret } =
      await this.#createClientCredentialInternal(scope)
    const created = Date.now()

    const db = await tables()
    await db.client_credentials.put({
      name,
      created,
      client_id,
      scope,
      sub: this.#sub,
    })

    return { name, created, client_id, client_secret, scope }
  }

  async #createClientCredentialInternal(scope: string) {
    const command = new CreateUserPoolClientCommand({
      AllowedOAuthFlows: ['client_credentials'],
      AllowedOAuthFlowsUserPoolClient: true,
      AllowedOAuthScopes: [scope],
      ClientName: 'auto-generated',
      GenerateSecret: true,
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
    })

    let response
    try {
      response = await cognito.send(command)
    } catch (e) {
      maybeThrowCognito(e, 'creating fake client credentials')
      const client_id = generators.random(26)
      const client_secret = generators.random(51)
      return { client_id, client_secret }
    }

    const client_id = response.UserPoolClient?.ClientId
    const client_secret = response.UserPoolClient?.ClientSecret
    if (!client_id) throw new Error('AWS SDK must return ClientId')
    if (!client_secret) throw new Error('AWS SDK must return ClientSecret')
    return { client_id, client_secret }
  }

  async #getClientSecretInternal(client_id: string) {
    const command = new DescribeUserPoolClientCommand({
      ClientId: client_id,
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
    })

    let response
    try {
      response = await cognito.send(command)
    } catch (e) {
      maybeThrowCognito(e, 'creating fake client secret')
      const client_secret = generators.random(51)
      return client_secret
    }

    const client_secret = response.UserPoolClient?.ClientSecret
    if (!client_secret) throw new Error('AWS SDK must return ClientSecret')
    return client_secret
  }

  async #deleteClientCredentialInternal(client_id: string) {
    const command = new DeleteUserPoolClientCommand({
      ClientId: client_id,
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
    })

    try {
      await cognito.send(command)
    } catch (e) {
      // Suppress error if Resource not found, which will throw when the
      // DeleteUserPoolClientCommand is called after a credential has
      // expired and the App Client is already deleted
      if (e instanceof ResourceNotFoundException) {
        return
      }
      maybeThrowCognito(e, 'deleting fake client credentials')
    }
  }

  /**
   * Get the names and descriptions of the groups to which the current user
   * belongs. The groups are sorted such that the default group is first,
   * followed by the remaining group sin alphabetical order.
   */
  async getGroupDescriptions(): Promise<[string, string | undefined][]> {
    const command = new ListGroupsCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
    })

    let response
    try {
      response = await cognito.send(command)
    } catch (e) {
      maybeThrowCognito(e, 'returning fake group descriptions')
      return [
        [
          'gcn.nasa.gov/kafka-public-consumer',
          'Consume any public Kafka topic',
        ],
      ]
    }

    const groupsMap: { [key: string]: string | undefined } = Object.fromEntries(
      response?.Groups?.map(({ GroupName, Description }) => [
        GroupName,
        Description,
      ])?.filter(([GroupName]) => GroupName) ?? []
    )

    return [...this.groups]
      .sort()
      .sort((a, b) => Number(b === defaultGroup) - Number(a === defaultGroup))
      .map((key) => [key, groupsMap[key]])
  }
}
