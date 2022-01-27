import {
  CognitoIdentityProviderClient,
  CreateUserPoolClientCommand,
  DeleteUserPoolClientCommand,
} from '@aws-sdk/client-cognito-identity-provider'

import type { SmithyException } from '@aws-sdk/types'

import { tables } from '@architect/functions'

import { generate } from 'generate-password'

import { storage } from '~/lib/auth.server'

const cognitoIdentityProviderClient = new CognitoIdentityProviderClient({
  region: 'us-east-1',
})

/*
 * Cognito user pool ID for generated client credentials.
 *
 * Note that his is safe to include in public code because it is public
 * knowledge anyway: the Cognito user pool ID is easily deduced from the OpenID
 * token endpoint URL, which is public knowledge because it is part of the
 * client configuration for end users.
 *
 * FIXME: this should be parameterized for dev, test, and prod deployments,
 * all of which will eventually have independent OIDC providers.
 */
const cognitoUserPoolId = 'us-east-1_KCtbSlt63'

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
    const command = new CreateUserPoolClientCommand({
      AllowedOAuthFlows: ['client_credentials'],
      AllowedOAuthFlowsUserPoolClient: true,
      AllowedOAuthScopes: ['gcn-tokens/kafka-consumer'],
      ClientName: 'auto-generated',
      GenerateSecret: true,
      UserPoolId: cognitoUserPoolId,
    })

    let response
    try {
      response = await cognitoIdentityProviderClient.send(command)
    } catch (e) {
      const name = (e as SmithyException).name
      if (
        name !== 'UnrecognizedClientException' ||
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
      UserPoolId: cognitoUserPoolId,
    })

    try {
      await cognitoIdentityProviderClient.send(command)
    } catch (e) {
      const name = (e as SmithyException).name
      if (
        name !== 'UnrecognizedClientException' ||
        process.env.NODE_ENV === 'production'
      )
        throw e
      console.warn(
        `Cognito threw ${name}. This would be an error in production. Since we are in ${process.env.NODE_ENV}, deleting fake client credentials.`
      )
    }
  }
}
