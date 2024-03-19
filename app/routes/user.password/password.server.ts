/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { ChangePasswordCommand } from '@aws-sdk/client-cognito-identity-provider'

import { storage } from '../_auth/auth.server'
import { getUser } from '../_auth/user.server'
import { cognito } from '~/lib/cognito.server'

export async function updatePassword(
  request: Request,
  oldPassword: string,
  newPassword: string
) {
  const user = await getUser(request)
  if (!user) throw new Response(null, { status: 403 })
  const session = await storage.getSession(request.headers.get('Cookie'))
  const accessToken = session.get('accessToken')
  const passwordData = {
    AccessToken: accessToken,
    PreviousPassword: oldPassword,
    ProposedPassword: newPassword,
  }

  const command = new ChangePasswordCommand(passwordData)
  try {
    await cognito.send(command)
  } catch (error) {
    if (
      error instanceof Error &&
      ['NotAuthorizedException', 'LimitExceededException'].includes(error.name)
    ) {
      return error.name
    } else {
      throw error
    }
  }
  return null
}
