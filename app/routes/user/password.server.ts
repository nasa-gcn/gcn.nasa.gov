/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { ChangePasswordCommand } from '@aws-sdk/client-cognito-identity-provider'

import { getOpenIDClient, storage } from '../__auth/auth.server'
import { getUser, parseTokenSet } from '../__auth/user.server'
import { client, maybeThrow } from './cognito.server'

export class PasswordManager {
  #oldPassword: string
  #newPassword: string
  #accessToken: string

  private constructor(
    oldPassword: string,
    newPassword: string,
    accessToken: string
  ) {
    this.#oldPassword = oldPassword
    this.#newPassword = newPassword
    this.#accessToken = accessToken
  }

  static async create(
    request: Request,
    oldPassword: string,
    newPassword: string
  ) {
    const user = await getUser(request)
    if (!user) throw new Response('not signed in', { status: 403 })
    const client = await getOpenIDClient()
    const session = await storage.getSession(request.headers.get('Cookie'))
    const refreshToken = session.get('refreshToken')
    const tokenSet = await client.refresh(refreshToken)
    const parsedTokenSet = parseTokenSet(tokenSet)

    if (!oldPassword || !newPassword || !parsedTokenSet.accessToken) {
      throw new Response('all password fields must be present', { status: 400 })
    }

    return new this(oldPassword, newPassword, parsedTokenSet.accessToken)
  }

  async updatePassword() {
    const passwordData = {
      AccessToken: this.#accessToken,
      PreviousPassword: this.#oldPassword,
      ProposedPassword: this.#newPassword,
    }
    let response
    try {
      const command = new ChangePasswordCommand(passwordData)
      const response = await client.send(command)
      return response
    } catch (e) {
      maybeThrow(e, 'creating fake user password')
      return response
    }
  }
}
