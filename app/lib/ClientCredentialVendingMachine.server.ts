import {
  CognitoIdentityProviderClient,
  CreateUserPoolClientCommand,
  DeleteUserPoolClientCommand,
} from '@aws-sdk/client-cognito-identity-provider'

import { tables } from '@architect/functions'

import { generate } from 'generate-password'

import { storage } from '~/lib/auth.server'
import memoizee from 'memoizee'

const cognitoIdentityProviderClient = new CognitoIdentityProviderClient({
  region: 'us-east-1',
})

const getCognitoUserPoolId = memoizee(() => {
  if (process.env.COGNITO_USER_POOL_ID) {
    return process.env.COGNITO_USER_POOL_ID
  } else if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Environment variable COGNITO_USER_POOL_ID must be defined.'
    )
  } else {
    console.warn(
      `Environment variable COGNITO_USER_POOL_ID must be defined for production. Since it is not set and the application is currently configured for ${process.env.NODE_ENV}, no Cognito client credentials will be created or deleted.`
    )
  }
})

export class ClientCredentialVendingMachine {
  #subiss: string

  private constructor(subiss: string) {
    this.#subiss = subiss
  }

  static async create(request: Request) {
    const session = await storage.getSession(request.headers.get('Cookie'))
    const subiss = session.get('subiss')

    if (!subiss) throw new Response(null, { status: 403 })

    return new this(subiss)
  }

  async getClientCredentials() {
    const db = await tables()
    const results = await db.client_credentials.query({
      KeyConditionExpression: 'subiss = :subiss',
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      ExpressionAttributeValues: {
        ':subiss': this.#subiss,
      },
      ProjectionExpression: 'client_id, #name',
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

  async createClientCredential(name?: string) {
    if (!name) throw new Response('name must not be empty', { status: 400 })

    const { client_id, client_secret } =
      await this.#createClientCredentialInternal()

    const db = await tables()
    await db.client_credentials.put({
      name,
      client_id,
      subiss: this.#subiss,
    })

    return { name, client_id, client_secret }
  }

  async #createClientCredentialInternal() {
    const cognitoUserPoolId = getCognitoUserPoolId()
    if (cognitoUserPoolId) {
      const command = new CreateUserPoolClientCommand({
        AllowedOAuthFlows: ['client_credentials'],
        AllowedOAuthFlowsUserPoolClient: true,
        AllowedOAuthScopes: ['gcn-tokens/kafka-consumer'],
        ClientName: 'auto-generated',
        GenerateSecret: true,
        UserPoolId: cognitoUserPoolId,
      })
      const response = await cognitoIdentityProviderClient.send(command)
      const client_id = response.UserPoolClient?.ClientId
      const client_secret = response.UserPoolClient?.ClientSecret
      if (!client_id) throw new Error('AWS SDK must return ClientId')
      if (!client_secret) throw new Error('AWS SDK must return ClientSecret')
      return { client_id, client_secret }
    } else {
      const client_id = generate({ length: 26 })
      const client_secret = generate({ length: 51 })
      return { client_id, client_secret }
    }
  }

  async #deleteClientCredentialInternal(client_id: string) {
    const cognitoUserPoolId = getCognitoUserPoolId()
    if (cognitoUserPoolId) {
      const command = new DeleteUserPoolClientCommand({
        ClientId: client_id,
        UserPoolId: cognitoUserPoolId,
      })
      await cognitoIdentityProviderClient.send(command)
    }
  }
}
