/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import type { UserType } from '@aws-sdk/client-cognito-identity-provider'

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
