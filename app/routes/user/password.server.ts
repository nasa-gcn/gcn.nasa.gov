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
import { maybeThrow } from './cognito.server'
import { cognito } from '~/lib/cognito.server'

export module PasswordManager {
  async function updatePasswordFunc(
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

    const passwordData = {
      AccessToken: parsedTokenSet.accessToken,
      PreviousPassword: oldPassword,
      ProposedPassword: newPassword,
    }

    let response
    try {
      const command = new ChangePasswordCommand(passwordData)
      const response = await cognito.send(command)
      return response
    } catch (e) {
      maybeThrow(e, 'creating fake user password')
      return response
    }
  }

  export async function updatePassword(
    request: Request,
    oldPassword: string,
    newPassword: string
  ) {
    updatePasswordFunc(request, oldPassword, newPassword)
  }
}

export default PasswordManager
