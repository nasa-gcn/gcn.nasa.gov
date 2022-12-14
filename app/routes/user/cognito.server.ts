/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import type { CognitoIdentityProviderServiceException } from '@aws-sdk/client-cognito-identity-provider'
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider'

export const client = new CognitoIdentityProviderClient({})

export function maybeThrow(e: any, warning: string) {
  const errorsAllowedInDev = [
    'ExpiredTokenException',
    'NotAuthorizedException',
    'UnrecognizedClientException',
  ]
  const { name } = e as CognitoIdentityProviderServiceException

  if (
    !errorsAllowedInDev.includes(name) ||
    process.env.NODE_ENV === 'production'
  ) {
    throw e
  } else {
    console.warn(
      `Cognito threw ${name}. This would be an error in production. Since we are in ${process.env.NODE_ENV}, ${warning}.`
    )
  }
}
