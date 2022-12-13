/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import {
  CognitoIdentityProviderClient,
  UpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { storage } from '../__auth/auth.server'
import { getUser, refreshUser } from '../__auth/user.server'

export class UserDataServer {
  #sub: string
  #cookie: string

  private constructor(sub: string, cookie: string) {
    this.#sub = sub
    this.#cookie = cookie
  }

  static async create(request: Request) {
    const user = await getUser(request)
    if (!user) throw new Response('not signed in', { status: 403 })
    return new this(user.sub, request.headers.get('Cookie') ?? '')
  }

  async updateUserData(displayName: string, affiliation: string) {
    const session = await storage.getSession(this.#cookie)
    const client = new CognitoIdentityProviderClient({})
    const command = new UpdateUserAttributesCommand({
      UserAttributes: [
        {
          Name: 'name',
          Value: name,
        },
        {
          Name: 'custom:affiliation',
          Value: affiliation,
        },
      ],
      AccessToken: session.get('accessToken'),
    })
    await client.send(command)
    await refreshUser(session.get('refreshToken'), session)
  }
}
