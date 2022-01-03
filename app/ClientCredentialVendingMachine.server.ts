import { getSub } from '~/auth.server'
import { db } from '~/db.server'
import { randomAlphanumericString } from '~/lib/RandomAlphanumeric'

export class ClientCredentialVendingMachine
{
  #sub: string

  constructor(sub: string)
  {
    this.#sub = sub
  }

  static async create(request: Request)
  {
    return new this(await getSub(request))
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

    const item = {
      name,
      client_id: randomAlphanumericString(26)
    }

    await db.clientCredential.create({
      data: {...item, sub: this.#sub}
    })

    return {...item, client_secret: randomAlphanumericString(52)}
  }
}
