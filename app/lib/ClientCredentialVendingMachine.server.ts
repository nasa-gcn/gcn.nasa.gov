import {
  CognitoIdentityProviderClient,
  CreateUserPoolClientCommand,
  DeleteUserPoolClientCommand,
} from '@aws-sdk/client-cognito-identity-provider'

import { generate } from 'generate-password'

import { storage } from '~/lib/auth.server'
import { db } from '~/db.server'
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
  #sub: string

  private constructor(sub: string) {
    this.#sub = sub
  }

  static async create(request: Request) {
    const session = await storage.getSession(request.headers.get('Cookie'))
    const sub = session.get('sub')

    if (!sub) throw new Response(null, { status: 403 })

    return new this(sub)
  }

  async getClientCredentials() {
    return await db.clientCredential.findMany({
      select: { name: true, client_id: true },
      where: { sub: this.#sub },
    })
  }

  async deleteClientCredential(client_id: string) {
    const cred = await db.clientCredential.findUnique({
      select: { sub: true },
      where: { client_id },
    })

    if (cred?.sub !== this.#sub) throw new Response(null, { status: 404 })

    await Promise.all([
      this.#deleteClientCredentialInternal(client_id),
      db.clientCredential.delete({
        where: { client_id },
      }),
    ])
  }

  async createClientCredential(name?: string) {
    if (!name) throw new Response('name must not be empty', { status: 400 })

    const { client_id, client_secret } =
      await this.#createClientCredentialInternal()

    await db.clientCredential.create({
      data: { name, client_id, sub: this.#sub },
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
        ClientName: this.#sub,
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
