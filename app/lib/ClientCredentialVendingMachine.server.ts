import {
  CognitoIdentityProviderClient,
  CreateUserPoolClientCommand,
  DeleteUserPoolClientCommand,
} from '@aws-sdk/client-cognito-identity-provider'

import { generate } from 'generate-password'

import { storage } from '~/lib/auth.server'
import { db } from '~/db.server'

const cognitoIdentityProviderClient = new CognitoIdentityProviderClient({
  region: 'us-east-1',
})

const isProduction = process.env.NODE_ENV === 'production'

async function cognitoCreateUserPoolClient(sub: string) {
  if (isProduction) {
    const command = new CreateUserPoolClientCommand({
      AllowedOAuthFlows: ['client_credentials'],
      AllowedOAuthFlowsUserPoolClient: true,
      AllowedOAuthScopes: ['gcn-tokens/kafka-consumer'],
      ClientName: sub,
      GenerateSecret: true,
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
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

async function cognitoDeleteUserPooolClient(client_id: string) {
  if (isProduction) {
    const command = new DeleteUserPoolClientCommand({
      ClientId: client_id,
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
    })
    await cognitoIdentityProviderClient.send(command)
  }
}

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

    if (cred?.sub !== this.#sub) throw new Response(null, { status: 403 })

    await cognitoDeleteUserPooolClient(client_id)

    await db.clientCredential.delete({
      where: { client_id },
    })
  }

  async createClientCredential(name?: string) {
    if (!name) throw new Response('name must not be empty', { status: 400 })

    const { client_id, client_secret } = await cognitoCreateUserPoolClient(
      this.#sub
    )

    await db.clientCredential.create({
      data: { name, client_id, sub: this.#sub },
    })

    return { name, client_id, client_secret }
  }
}
