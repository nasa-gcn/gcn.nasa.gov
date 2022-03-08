/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import {
  CognitoIdentityProviderClient,
  CreateUserPoolClientCommand,
  DeleteUserPoolClientCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import type { SmithyException } from '@aws-sdk/types'
import { tables } from '@architect/functions'
import { generate } from 'generate-password'
import { storage } from './auth.server'
import { COGNITO_USER_POOL_ID } from './conf.server'

const cognitoIdentityProviderClient = new CognitoIdentityProviderClient({})

const errorsAllowedInDev = [
  'ExpiredTokenException',
  'UnrecognizedClientException',
]

export class ClientCredentialVendingMachine {
  #subiss: string
  #groups: string[]

  private constructor(subiss: string, groups: string[]) {
    this.#subiss = subiss
    this.#groups = groups
  }

  static async create(request: Request) {
    const session = await storage.getSession(request.headers.get('Cookie'))
    const subiss = session.get('subiss')
    const groups = session.get('groups')

    if (!subiss) throw new Response(null, { status: 403 })

    return new this(subiss, groups)
  }

  get groups() {
    return this.#groups
  }

  async getClientCredentials() {
    const db = await tables()
    const results = await db.client_credentials.query({
      KeyConditionExpression: 'subiss = :subiss',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#scope': 'scope',
      },
      ExpressionAttributeValues: {
        ':subiss': this.#subiss,
      },
      ProjectionExpression: 'client_id, #name, #scope',
    })
    return results.Items
  }

  async deleteClientCredential(client_id: string) {
    const db = await tables()

    // Make sure that the user actually owns the given client ID before
    // we try to delete it
    const item = await db.client_credentials.get({
      subiss: this.#subiss,
      client_id,
    })
    if (!item) throw new Response(null, { status: 404 })

    await Promise.all([
      this.#deleteClientCredentialInternal(client_id),
      db.client_credentials.delete({ subiss: this.#subiss, client_id }),
    ])
  }

  async createClientCredential(name?: string, scope?: string) {
    if (!name) throw new Response('name must not be empty', { status: 400 })
    if (!scope) throw new Response('scope must not be empty', { status: 400 })
    if (!this.#groups.includes(scope))
      throw new Response('user does not belong to the requested group', {
        status: 403,
      })

    const { client_id, client_secret } =
      await this.#createClientCredentialInternal(scope)

    const db = await tables()
    await db.client_credentials.put({
      name,
      client_id,
      scope,
      subiss: this.#subiss,
    })

    return { name, client_id, client_secret, scope }
  }

  async #createClientCredentialInternal(scope: string) {
    const command = new CreateUserPoolClientCommand({
      AllowedOAuthFlows: ['client_credentials'],
      AllowedOAuthFlowsUserPoolClient: true,
      AllowedOAuthScopes: [scope],
      ClientName: 'auto-generated',
      GenerateSecret: true,
      UserPoolId: COGNITO_USER_POOL_ID,
    })

    let response
    try {
      response = await cognitoIdentityProviderClient.send(command)
    } catch (e) {
      const name = (e as SmithyException).name
      if (
        !errorsAllowedInDev.includes(name) ||
        process.env.NODE_ENV === 'production'
      )
        throw e
      console.warn(
        `Cognito threw ${name}. This would be an error in production. Since we are in ${process.env.NODE_ENV}, creating fake client credentials.`
      )
      const client_id = generate({ length: 26 })
      const client_secret = generate({ length: 51 })
      return { client_id, client_secret }
    }

    const client_id = response.UserPoolClient?.ClientId
    const client_secret = response.UserPoolClient?.ClientSecret
    if (!client_id) throw new Error('AWS SDK must return ClientId')
    if (!client_secret) throw new Error('AWS SDK must return ClientSecret')
    return { client_id, client_secret }
  }

  async #deleteClientCredentialInternal(client_id: string) {
    const command = new DeleteUserPoolClientCommand({
      ClientId: client_id,
      UserPoolId: COGNITO_USER_POOL_ID,
    })

    try {
      await cognitoIdentityProviderClient.send(command)
    } catch (e) {
      const name = (e as SmithyException).name
      if (
        !errorsAllowedInDev.includes(name) ||
        process.env.NODE_ENV === 'production'
      )
        throw e
      console.warn(
        `Cognito threw ${name}. This would be an error in production. Since we are in ${process.env.NODE_ENV}, deleting fake client credentials.`
      )
    }
  }
}
