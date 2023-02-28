/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import {
  AdminAddUserToGroupCommand,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider'
import { group } from '~/routes/circulars/circulars.server'
import type { PostConfirmationConfirmSignUpTriggerEvent } from 'aws-lambda'
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'
import {
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb'

export async function handler(
  event: PostConfirmationConfirmSignUpTriggerEvent
) {
  let email, username
  if (typeof event == 'string') {
    const parsedEvent = JSON.parse(event)
    email = parsedEvent.request.userAttributes.email
    username = parsedEvent.userName
  } else {
    email = event.request.userAttributes.email
    username = event.userName
  }
  if (!email || !username) throw new Error('Email and username are needed')

  const cognito = new CognitoIdentityProviderClient({})
  const ssm = new SSMClient({})
  const dynamo = new DynamoDBClient({})

  // 1. Add user to submitters group
  await cognito.send(
    new AdminAddUserToGroupCommand({
      Username: username,
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      GroupName: group,
    })
  )

  // 2. Their info gets migrated into the corresponding fields in their cognito account
  const legacyTableName = (
    await ssm.send(
      new GetParameterCommand({
        Name: '/RemixGcnProduction/tables/legacy_users',
      })
    )
  ).Parameter?.Value
  if (!legacyTableName) throw new Error('Legacy User table does not exist')

  const response = await dynamo.send(
    new GetItemCommand({
      TableName: legacyTableName,
      Key: { email: { S: email } },
    })
  )

  if (!response.Item) throw new Error('No legacy user found for provided email')

  await cognito.send(
    new AdminUpdateUserAttributesCommand({
      Username: username,
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      UserAttributes: [
        { Name: 'custom:affiliation', Value: response.Item.affiliation.S },
        { Name: 'name', Value: response.Item.name.S },
      ],
    })
  )

  // 3. Circulars they have submitted update their sub field to match the new one
  const getUserCommandResponse = await cognito.send(
    new AdminGetUserCommand({
      Username: username,
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
    })
  )
  if (!getUserCommandResponse) throw new Error('User not found')
  const sub = getUserCommandResponse.UserAttributes?.find(
    (attr) => attr.Name == 'sub'
  )?.Value
  if (!sub) throw new Error('Sub not found')

  const circularsTableName = (
    await ssm.send(
      new GetParameterCommand({
        Name: '/RemixGcnProduction/tables/circulars',
      })
    )
  ).Parameter?.Value
  if (!circularsTableName) throw new Error('Circular table not found')

  const circularResults = await dynamo.send(
    new QueryCommand({
      TableName: circularsTableName,
      IndexName: 'circularsByEmail',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
    })
  )

  if (circularResults.Items?.length) {
    const updatePromises = circularResults.Items.map((item) => {
      return dynamo.send(
        new UpdateItemCommand({
          TableName: circularsTableName,
          Key: {
            dummy: { N: '0' },
            circularId: { N: `${item.circularId}` },
          },
          UpdateExpression: 'set #sub = :sub',
          ExpressionAttributeNames: {
            '#sub': 'sub',
          },
          ExpressionAttributeValues: {
            ':sub': { S: sub },
          },
        })
      )
    })
    await Promise.all(updatePromises)
  }

  // 4. Their info is removed from the legacy table
  await dynamo.send(
    new DeleteItemCommand({
      TableName: legacyTableName,
      Key: { email: { S: email } },
    })
  )
}
