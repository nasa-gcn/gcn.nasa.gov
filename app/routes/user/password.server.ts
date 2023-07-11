/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { ChangePasswordCommand } from '@aws-sdk/client-cognito-identity-provider'
import { isRouteErrorResponse } from '@remix-run/react'

import { storage } from '../__auth/auth.server'
import { getUser } from '../__auth/user.server'
import { cognito } from '~/lib/cognito.server'

export async function updatePassword(
  request: Request,
  oldPassword: string,
  newPassword: string
) {
  try {
    const user = await getUser(request)
    if (!user)
      throw new Response('you must be signed in to reset your password', {
        status: 403,
      })
    const session = await storage.getSession(request.headers.get('Cookie'))
    const accessToken = session.get('accessToken')

    if (!oldPassword || !newPassword || !accessToken) {
      throw new Response('all password fields must be present', { status: 400 })
    }

    const passwordData = {
      AccessToken: accessToken,
      PreviousPassword: oldPassword,
      ProposedPassword: newPassword,
    }

    const command = new ChangePasswordCommand(passwordData)
    await cognito.send(command)
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'NotAuthorizedException') {
        throw new Response(error.message, { status: 401 })
      }
      if (error.name === 'InvalidPasswordException') {
        throw new Response(error.message, {
          statusText: error.message,
          status: 400,
        })
      } else {
        throw new Error(error.message)
      }
    } else if (isRouteErrorResponse(error)) {
      throw new Response(error.data, {
        statusText: error.statusText,
        status: error.status,
      })
    } else if (error instanceof Response) {
      if (error.status === 403) {
        throw new Response(error.type, {
          statusText: 'User must be logged in',
          status: error.status,
        })
      } else {
        throw new Response(error.type, {
          statusText: 'Error',
          status: error.status,
        })
      }
    }
  }
}
