/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { paginateScan } from '@aws-sdk/lib-dynamodb'

import type { Team, TeamMember } from './teams.server'

export type UserMetadata = {
  sub: string
  email: string
  username?: string
  affiliation?: string
}

export type TeamPermission = Team & {
  permission: string
}

export async function addUser(user: UserMetadata) {
  const db = await tables()
  await db.users.put(user)
}

export async function getUserMetadata(sub: string) {
  const db = await tables()
  const user = await db.users.get({ sub })
  return user
}

export async function findUsersByNameOrEmail(
  value: string
): Promise<UserMetadata[]> {
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument
  const TableName = db.name('users')

  const pages = paginateScan(
    { client },
    {
      TableName,
      FilterExpression: 'contains(username, :value) OR contains(email, :value)',
      ExpressionAttributeValues: {
        ':value': value,
      },
    }
  )
  const users: UserMetadata[] = []
  for await (const page of pages) {
    const newUsers = page.Items as UserMetadata[]
    if (newUsers) users.push(...newUsers)
  }
  return users
}

export async function updateUser(user: UserMetadata) {
  const db = await tables()
  await db.users.update({
    Key: { sub: user.sub },
    UpdateExpression:
      'set username = :username, affiliation = :affiliation, email = :email',
    ExpressionAttributeValues: {
      ':username': user.username,
      ':affiliation': user.affiliation,
      ':email': user.email,
    },
  })
}

export async function getUsersKafkaPermissions(
  sub: string
): Promise<TeamPermission[]> {
  const db = await tables()
  const items = (
    await db.team_members.query({
      KeyConditionExpression: '#sub = :sub',
      ExpressionAttributeNames: {
        '#sub': 'sub',
      },
      ExpressionAttributeValues: {
        ':sub': sub,
      },
    })
  ).Items as TeamMember[]

  const teams = (await Promise.all(
    items.map((item) => db.teams.get({ teamId: item.teamId }))
  )) as Team[]
  // Should this return permissions just `verb:resource`? ie, admin:team_abc ? or parse it later?
  return items.map((item) => {
    const team = teams.find((x) => x.teamId == item.teamId)
    if (!team) throw new Response(null, { status: 500 })
    return {
      teamId: item.teamId,
      permission: item.permission,
      teamName: team.teamName,
      description: team.description,
      topic: team.topic,
    }
  })
}
