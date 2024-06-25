/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type {
  AttributeType,
  CognitoIdentityProviderServiceException,
  GroupType,
  UserType,
} from '@aws-sdk/client-cognito-identity-provider'
import {
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
  CognitoIdentityProviderClient,
  CreateGroupCommand,
  DeleteGroupCommand,
  GetGroupCommand,
  ListUsersCommand,
  UpdateGroupCommand,
  paginateAdminListGroupsForUser,
  paginateListGroups,
  paginateListUsers,
  paginateListUsersInGroup,
} from '@aws-sdk/client-cognito-identity-provider'

export const cognito = new CognitoIdentityProviderClient({})
const UserPoolId = process.env.COGNITO_USER_POOL_ID

export interface UserData {
  email: string
  sub?: string
  name?: string
  affiliation?: string
  receive?: boolean
  submit?: boolean
}

/**
 * Returns the value of a specified Attribute if it exists on a user object
 *
 * @param Attributes Derived from a provided user profile in a Amazon Cognito user pool.
 * @param key The string name of the Cognito Attribute
 */
export function extractAttribute(
  attributes: AttributeType[] | undefined,
  key: string
) {
  return attributes?.find(({ Name }) => key === Name)?.Value
}

/**
 * Returns the value of a specified Attribute if it exists on a user object
 *
 * Throws an Error if the attribute is missing from thr provided user
 *
 * @param user A user profile in a Amazon Cognito user pool.
 * @param key The string name of the Cognito Attribute
 */
export function extractAttributeRequired(
  attributes: AttributeType[] | undefined,
  key: string
) {
  const value = extractAttribute(attributes, key)
  if (value === undefined)
    throw new Error(`required user attribute ${key} is missing`)
  return value
}

/**
 * Gets another user from cognito
 *
 * @param sub - the sub of another user
 * @returns a user if found, otherwise undefined
 */
export async function getCognitoUserFromSub(sub: string) {
  const escapedSub = sub.replaceAll('"', '\\"')
  const user = (
    await cognito.send(
      new ListUsersCommand({
        UserPoolId,
        Filter: `sub = "${escapedSub}"`,
      })
    )
  )?.Users?.[0]

  if (!user?.Username)
    throw new Response('Requested user does not exist', {
      status: 400,
    })

  return user
}

export async function listUsers() {
  const pages = paginateListUsers(
    { client: cognito },
    {
      UserPoolId,
    }
  )
  const users: UserData[] = []
  for await (const page of pages) {
    const nextUsers = page.Users
    if (nextUsers)
      users.push(
        ...nextUsers
          .filter((user) => Boolean(extractAttribute(user.Attributes, 'email')))
          .map((user) => ({
            sub: extractAttributeRequired(user.Attributes, 'sub'),
            email: extractAttributeRequired(user.Attributes, 'email'),
            name: extractAttribute(user.Attributes, 'name'),
            affiliation: extractAttribute(
              user.Attributes,
              'custom:affiliation'
            ),
          }))
      )
  }
  return users
}

export async function listUsersInGroup(GroupName: string) {
  console.warn(
    'using a paginator; replace with alternative API calls that avoid large result sets'
  )
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

export async function createGroup(GroupName: string, Description: string) {
  const command = new CreateGroupCommand({
    GroupName,
    UserPoolId,
    Description,
  })
  await cognito.send(command)
}

export async function getGroup(GroupName: string) {
  const command = new GetGroupCommand({
    GroupName,
    UserPoolId,
  })
  return await cognito.send(command)
}

export async function getGroups() {
  const pages = paginateListGroups({ client: cognito }, { UserPoolId })
  const groups: GroupType[] = []
  for await (const page of pages) {
    const nextGroups = page.Groups
    if (nextGroups) groups.push(...nextGroups)
  }

  return groups
}

export async function allGroupNames(): Promise<string[]> {
  const names = (await getGroups())
    .map((group) => group.GroupName)
    .filter((group) => typeof group === 'string') as string[]
  return names
}

export async function updateGroup(GroupName: string, Description: string) {
  const command = new UpdateGroupCommand({
    GroupName,
    UserPoolId,
    Description,
  })
  await cognito.send(command)
}

export async function deleteGroup(GroupName: string) {
  const command = new DeleteGroupCommand({
    GroupName,
    UserPoolId,
  })
  await cognito.send(command)
}

export async function addUserToGroup(Username: string, GroupName: string) {
  const command = new AdminAddUserToGroupCommand({
    UserPoolId,
    Username,
    GroupName,
  })
  await cognito.send(command)
}

export async function listGroupsForUser(Username: string) {
  const pages = paginateAdminListGroupsForUser(
    { client: cognito },
    { UserPoolId, Username }
  )
  const groups: GroupType[] = []
  for await (const page of pages) {
    const nextGroups = page.Groups
    if (nextGroups) groups.push(...nextGroups)
  }

  return groups
}

export async function getUserGroupStrings(Username: string) {
  const Groups = await listGroupsForUser(Username)
  return Groups?.map(({ GroupName }) => GroupName).filter(Boolean) as
    | string[]
    | undefined
}

export async function removeUserFromGroup(Username: string, GroupName: string) {
  const command = new AdminRemoveUserFromGroupCommand({
    UserPoolId,
    Username,
    GroupName,
  })
  await cognito.send(command)
}
