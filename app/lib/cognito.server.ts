/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type {
  CognitoIdentityProviderServiceException,
  UserType,
} from '@aws-sdk/client-cognito-identity-provider'
import {
  CognitoIdentityProviderClient,
  paginateListUsersInGroup,
} from '@aws-sdk/client-cognito-identity-provider'

export const cognito = new CognitoIdentityProviderClient({})

/**
 * Returns the value of a specified Attribute if it exists on a user object
 *
 * @param Attributes Derived from a provided user profile in a Amazon Cognito user pool.
 * @param key The string name of the Cognito Attribute
 */
export function extractAttribute({ Attributes }: UserType, key: string) {
  return Attributes?.find(({ Name }) => key === Name)?.Value
}

/**
 * Returns the value of a specified Attribute if it exists on a user object
 *
 * Throws an Error if the attribute is missing from thr provided user
 *
 * @param user A user profile in a Amazon Cognito user pool.
 * @param key The string name of the Cognito Attribute
 */
export function extractAttributeRequired(user: UserType, key: string) {
  const value = extractAttribute(user, key)
  if (value === undefined)
    throw new Error(`required user attribute ${key} is missing`)
  return value
}

export async function listUsersInGroup(GroupName: string) {
  console.warn(
    'using a paginator; replace with alternative API calls that avoid large result sets'
  )
  const UserPoolId = process.env.COGNITO_USER_POOL_ID
  const pages = paginateListUsersInGroup(
    { client: cognito },
    { GroupName, UserPoolId }
  )
  const users: UserType[] = []
  for await (const page of pages) {
    const nextUsers = page.Users
    if (nextUsers) users.push(...nextUsers)
  }
  return users
}

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
