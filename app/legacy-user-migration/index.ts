/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { tables } from '@architect/functions'
import {
  AdminAddUserToGroupCommand,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider'
import { group } from '~/routes/circulars/circulars.server'

export async function handler({
  request: {
    userAttributes: { email },
  },
  userPoolId: UserPoolId,
  userName: Username,
}: any) {
  const cognito = new CognitoIdentityProviderClient({})
  const db = await tables()

  // 1. Add user to submitters group
  await cognito.send(
    new AdminAddUserToGroupCommand({
      Username: Username,
      UserPoolId: UserPoolId,
      GroupName: group,
    })
  )

  // 2. Their info gets migrated into the corresponding fields in their cognito account
  const response = await db.legacy_users.get({ email: email })
  if (!response) throw new Error('No legacy user found for provided email')
  await cognito.send(
    new AdminUpdateUserAttributesCommand({
      Username: Username,
      UserPoolId: UserPoolId,
      UserAttributes: [
        { Name: 'custom:affiliation', Value: response.affiliation },
        { Name: 'name', Value: response.name },
      ],
    })
  )

  // 3. Circulars they have submitted update their sub field to match the new one
  const getUserCommandResponse = await cognito.send(
    new AdminGetUserCommand({
      Username: Username,
      UserPoolId: UserPoolId,
    })
  )
  if (!getUserCommandResponse) throw new Error('User not found')
  const sub = getUserCommandResponse.UserAttributes?.find(
    (attr) => attr.Name == 'sub'
  )?.Value
  if (!sub) throw new Error('Sub not found')
  // Get items without a defined sub and where the submitter has a match to their email
  const circularResults = await db.circulars.scan({
    FilterExpression:
      'attribute_not_exists(sub) AND contais(submitter, :userEmail)',
    ExpressionAttributeValues: { ':userEmail': email },
  })
  if (!circularResults.Items.length)
    console.log("User's email not found on any existing circulars")
  else {
    const updatePromises = circularResults.Items.map((item) => {
      return db.circulars.update({
        Key: { dummy: 0, circularId: item.circularId },
        UpdateExpression: 'set #sub = :sub',
        ExpressionAttributeNames: {
          '#sub': 'sub',
        },
        ExpressionAttributeValues: {
          ':sub': sub,
        },
      })
    })
    await Promise.all(updatePromises)
  }

  // 4. Their info is removed from the legacy table
  await db.legacy_users.delete({ email: email })
}
