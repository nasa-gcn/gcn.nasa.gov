import {
  CognitoIdentityProviderClient,
  CreateUserPoolClientCommand,
  DeleteUserPoolClientCommand
} from '@aws-sdk/client-cognito-identity-provider'

import { storage } from '~/lib/auth.server'
import { db } from '~/db.server'

const cognitoIdentityProviderClient = new CognitoIdentityProviderClient({
  region: 'us-east-1'
})

export class ClientCredentialVendingMachine
{
  #sub: string

  constructor(sub: string)
  {
    this.#sub = sub
  }

  static async create(request: Request)
  {
    const session = await storage.getSession(request.headers.get('Cookie'))
    const sub = session.get('sub')

    if (!sub)
      throw new Response('Forbidden', { status: 403 })

    return new this(sub)
  }

  async getClientCredentials()
  {
    return await db.clientCredential.findMany({
      select: { name: true, client_id: true },
      where: { sub: this.#sub }
    })  
  }

  async deleteClientCredential(client_id: string)
  {
    const cred = await db.clientCredential.findUnique({
      select: { sub: true },
      where: {client_id}
    })

    if (cred?.sub !== this.#sub)
    {
      throw new Response('Forbidden', { status: 403 })
    }

    const command = new DeleteUserPoolClientCommand({
      ClientId: client_id,
      UserPoolId: process.env.COGNITO_USER_POOL_ID
    })
    await cognitoIdentityProviderClient.send(command)
  
    await db.clientCredential.delete({
      where: {client_id}
    })
  }

  async createClientCredential(name?: string)
  {
    if (!name)
    {
      throw new Response('name must not be empty', { status: 400 })
    }
  
    const command = new CreateUserPoolClientCommand({
      AllowedOAuthFlows: ['client_credentials'],
      AllowedOAuthFlowsUserPoolClient: true,
      AllowedOAuthScopes: ['gcn-tokens/kafka-consumer'],
      ClientName: this.#sub,
      GenerateSecret: true,
      UserPoolId: process.env.COGNITO_USER_POOL_ID
    })
    const response = await cognitoIdentityProviderClient.send(command)
    const client_id = response.UserPoolClient?.ClientId!
    const client_secret = response.UserPoolClient?.ClientSecret!
  
    const item = { name, client_id }

    await db.clientCredential.create({
      data: {...item, sub: this.#sub}
    })

    return {...item, client_secret}
  }
}
