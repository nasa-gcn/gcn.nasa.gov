/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import crypto from 'crypto'

import type { User } from '~/routes/_auth/user.server'

export type Team = {
  teamId: string
  teamName: string
  description: string
  topic: string
}

export type TeamMember = {
  sub: string
  teamId: string
  permission: string
}

export async function createTeam(
  name: string,
  description: string,
  topic: string
) {
  const db = await tables()

  const team: Team = {
    teamId: crypto.randomUUID(),
    teamName: name,
    description,
    topic,
  }
  await db.teams.put(team)
  return team
}

export async function deleteTeam(teamId: string) {
  const db = await tables()
  await db.teams.delete({ teamId })
  const teamPermissions = (
    await db.team_members.query({
      IndexName: 'usersByTeam',
      KeyConditionExpression: 'teamId = :teamId',
      ExpressionAttributeValues: {
        ':teamId': teamId,
      },
    })
  ).Items as TeamMember[]

  await Promise.all(
    teamPermissions.map((x) => db.team_members.delete({ sub: x.sub, teamId }))
  )
}

export async function addUserToTeam(
  user: User,
  teamId: string,
  permission: 'admin' | 'producer' | 'consumer'
) {
  const db = await tables()

  await db.team_members.put({
    sub: user.sub,
    teamId,
    permission,
  })
}

export async function getUsersByTeamId(teamId: string) {
  const db = await tables()
  const { Items } = await db.team_members.query({
    IndexName: 'usersByTeam',
    KeyConditionExpression: 'teamId = :teamId',
    ExpressionAttributeValues: {
      ':teamId': teamId,
    },
  })
  return Items as TeamMember[]
}

export async function removeUserFromTeam(sub: string, teamId: string) {
  const db = await tables()
  await db.user_permissons.delete({ sub, teamId })
}
