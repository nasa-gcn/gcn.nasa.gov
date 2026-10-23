/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import { type DynamoDBDocument, paginateScan } from '@aws-sdk/lib-dynamodb'
import crypto from 'crypto'
import { dedent } from 'ts-dedent'

import { sendEmail } from './email.server'
import { origin } from './env.server'
import type { UserMetadata } from './user.server'
import type { User } from '~/routes/_auth/user.server'

const fromName = 'GCN Teams'

export type Team = {
  teamId: string
  teamName: string
  description: String
  topic: string
  isPublic: boolean
}

export type Permission = 'admin' | 'write' | 'read'

/**
 * Maps a User to a Team and their respective permission level
 * to a topic within the scope of a team.
 *
 * @permission represents a level of access to a given topic:
 * - "read": Consumer permissions only.
 * - "write": Producer and Consumer permissions.
 * - "admin": Producer and Consumer permissions, plus team level
 *    moderator status, reserved for PoCs, must be at least one
 *    per team.
 */
export type TeamMember = {
  sub: string
  teamId: string
  permission: Permission
}

export type FullMemberInfo = TeamMember & {
  email?: string
  groups?: string[]
  username?: string
}

export type TeamInvite = {
  teamId: string
  sub: string
  permission: Permission
}

export type TeamInviteWithEmail = TeamInvite & {
  email: string
}

/**
 * This function will create an entry in DynamoDB for the new
 * team, and send a notification to the listed PoC that they are
 * being added as an admin to this team.
 *
 * Once the PoC accepts, they will have the ability to perform
 * team admin level interactions, adding producers, consumers, etc.
 *
 * @param user current user, if they are not an site admin, this will throw an error
 * @param teamName mutable field for team name
 * @param description mutable field for team description
 * @param pocEmail address of user to be added as team admin
 * @param topicName highest level topic/prefix the team can manage topics under.
 *
 */
export async function createTeam(
  user: User,
  teamName: string,
  description: string,
  userSub: string,
  topicName: string
) {
  if (!(await userHasPermission(user.sub, 'gcn.nasa.gov', 'admin')))
    throw new Response(null, { status: 403 })

  const db = await tables()
  const teamId = crypto.randomUUID()
  const team: Team = {
    teamId,
    teamName,
    description,
    topic: topicName,
    isPublic: false,
  }
  await db.teams.put(team)
  // TODO: Add KafkaACL functions
  const pocEmail = (await db.users.get({ sub: userSub })).email
  await Promise.all([
    db.team_invites.put({
      teamId: team.teamId,
      sub: userSub,
      permission: 'admin',
    }),
    sendEmail({
      fromName,
      to: [pocEmail],
      subject: 'GCN Team Admin Invite',
      body: dedent`You have been added as a team admin to ${teamName}. 
      
      To continue, go to ${origin}/teams and accept the invite. Once complete, you will be able to invite other users to join your team.`,
    }),
  ])

  return team
}

export async function getTeam(teamId: string) {
  const db = await tables()
  const team: Team = await db.teams.get({ teamId })
  const teamMembers = await getTeamMembers(teamId)
  const pendingInvites = await getTeamInvites(teamId)
  return {
    ...team,
    teamMembers,
    pendingInvites,
  }
}

export async function getTeamMembers(
  teamId: string
): Promise<FullMemberInfo[]> {
  const db = await tables()
  const members = (
    await db.team_members.query({
      KeyConditionExpression: 'teamId = :teamId',
      IndexName: 'usersByTeam',
      ExpressionAttributeValues: {
        ':teamId': teamId,
      },
    })
  ).Items as TeamMember[]

  const users: User[] = await Promise.all(
    members.map((member) => db.users.get({ sub: member.sub }))
  )
  const userMap = new Map<string, User>(users.map((user) => [user.sub, user]))

  const combined = members.map((member) => {
    const user = userMap.get(member.sub)
    const merged = {
      ...user,
      ...member,
    }

    const { cognitoUserName, idp, ...cleaned } = merged
    return cleaned
  })
  return combined
}

export async function getTeamInvites(
  teamId: string
): Promise<TeamInviteWithEmail[]> {
  const db = await tables()
  const invites = (
    await db.team_invites.query({
      KeyConditionExpression: 'teamId = :teamId',
      ExpressionAttributeValues: {
        ':teamId': teamId,
      },
    })
  ).Items as TeamInvite[]

  return Promise.all(
    invites.map(async (invite) => ({
      ...invite,
      email: ((await db.users.get({ sub: invite.sub })) as UserMetadata).email,
    }))
  )
}

/**
 *
 * @param sub - User's ID
 * @returns An array of team items containing the team' name, description,
 * and ID for each Team which a user belongs to
 */
export async function getUsersTeams(sub: string): Promise<Team[]> {
  const db = await tables()
  const memberships: TeamMember[] = (
    await db.team_members.query({
      KeyConditionExpression: '#sub = :sub',
      ExpressionAttributeNames: {
        '#sub': 'sub',
      },
      ExpressionAttributeValues: {
        ':sub': sub,
      },
    })
  ).Items

  const teams: Team[] = await Promise.all(
    memberships.map((x) => db.teams.get({ teamId: x.teamId }))
  )
  return teams
}

export async function getAllTeams(): Promise<Team[]> {
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument
  const TableName = db.name('teams')
  const pages = paginateScan(
    { client },
    { AttributesToGet: ['teamId', 'teamName', 'description'], TableName }
  )
  const results: Team[] = []
  for await (const page of pages) {
    results.push(...(page.Items as Team[]))
  }
  return results
}

export async function updateTeam(teamId: string, description: string) {
  const db = await tables()
  await db.teams.update({
    Key: { teamId },
    UpdateExpression: 'set #description = :description',
    ExpressionAttributeNames: {
      '#description': 'description',
    },
    ExpressionAttributeValues: {
      ':description': description,
    },
  })
}

export async function deleteTeam(teamId: string) {
  const db = await tables()
  await db.teams.delete({ teamId })
  const client = db._doc as unknown as DynamoDBDocument
  const TeamMembersTableName = db.name('team_members')
  const TeamInvitesTableName = db.name('team_invites')
  const team_members = await getTeamMembers(teamId)
  const team_invites = await getTeamInvites(teamId)

  await client.batchWrite({
    RequestItems: {
      [TeamMembersTableName]: team_members.map((x) => ({
        DeleteRequest: {
          Key: {
            sub: { S: x.sub },
            teamId: { S: teamId },
          },
        },
      })),
      [TeamInvitesTableName]: team_invites.map((x) => ({
        DeleteRequest: {
          Key: {
            teamId: { S: teamId },
            sub: { S: x.sub },
          },
        },
      })),
    },
  })
}

export async function getTeamMembership(sub: string, teamId: string) {
  const db = await tables()
  return await db.team_members.get({
    sub,
    teamId,
  })
}

export async function userIsTeamAdmin(
  sub: string,
  teamId: string
): Promise<boolean> {
  const membership = await getTeamMembership(sub, teamId)
  return membership && membership.permission === 'admin'
}

export async function inviteUserToTeam(
  user: User,
  teamId: string,
  newUserSub: string,
  permission: Permission
) {
  const db = await tables()
  const team = (await db.teams.get({ teamId })) as Team
  if (!team) throw new Response(null, { status: 404 })

  const newUserEmail = (
    (await db.users.get({ sub: newUserSub })) as UserMetadata
  ).email

  await Promise.all([
    db.team_invites.put({
      teamId,
      sub: newUserSub,
      permission,
    }),
    sendEmail({
      to: [newUserEmail],
      fromName,
      subject: `GCN Teams Invite: ${team.teamName}`,
      body: dedent`You have been invited to join ${team.teamName} by ${user.name}. 
      To accept, go to ${origin}/teams and accept the invite. Once complete, you will be able to create client credentials to 
      produce and/or consume Kafka messages, as determined by your team admin.`,
    }),
  ])
}

export async function getInvitesForUser(user: User) {
  const db = await tables()
  const invites = (
    await db.team_invites.query({
      KeyConditionExpression: '#sub = :sub',
      IndexName: 'invitesBySub',
      ExpressionAttributeNames: {
        '#sub': 'sub',
      },
      ExpressionAttributeValues: {
        ':sub': user.sub,
      },
    })
  ).Items as TeamInvite[]

  return Promise.all(
    invites.map(async (invite) => ({
      ...invite,
      teamName: ((await db.teams.get({ teamId: invite.teamId })) as Team)
        .teamName,
    }))
  )
}

export async function deleteTeamInvite(sub: string, teamId: string) {
  const db = await tables()
  await db.team_invites.delete({ teamId, sub })
}

export async function acceptTeamInvite(sub: string, teamId: string) {
  const db = await tables()
  const invite: TeamInvite = await db.team_invites.get({
    teamId,
    sub,
  })
  if (!invite) throw new Response(null, { status: 404 })
  await setUsersTeamPermission(sub, teamId, invite.permission)
  await deleteTeamInvite(sub, teamId)
}

export async function setUsersTeamPermission(
  sub: string,
  teamId: string,
  permission: Permission
) {
  await teamAdminCheck(teamId, sub)
  const db = await tables()
  await db.team_members.put({
    sub,
    teamId,
    permission,
  })
}

export async function removeUserFromTeam(sub: string, teamId: string) {
  const db = await tables()
  await teamAdminCheck(teamId, sub)
  await db.team_members.delete({ sub, teamId })
}

/**
 * This function should be used to prevent changes that may result in a team no longer having an admin
 * @throws 400 error if the sub provided is the only team admin for a given teamId
 * @param teamId
 * @param sub
 */
async function teamAdminCheck(teamId: string, sub: string) {
  const db = await tables()
  const admins = (
    await db.team_members.query({
      IndexName: 'teamMembersByPermission',
      KeyConditionExpression: '#permission = :permission',
      FilterExpression: 'teamId = :teamId',
      ExpressionAttributeNames: {
        '#permission': 'permission',
      },
      ExpressionAttributeValues: {
        ':permission': 'admin',
        ':teamId': teamId,
      },
    })
  ).Items as TeamMember[]
  if (!admins.some((user) => user.sub !== sub)) {
    throw new Response(null, { status: 400 })
  }
}

export async function userHasPermission(
  sub: string,
  topicName: string,
  permission: Permission
): Promise<boolean> {
  const db = await tables()
  const teamId: string = (
    await db.teams.query({
      IndexName: 'teamsByTopic',
      KeyConditionExpression: 'topicName = :topicName',
      ExpressionAttributeValues: {
        ':topicName': topicName,
      },
    })
  ).Items[0]?.teamId

  if (!teamId) throw new Response(null, { status: 404 })

  const membership = (
    await db.team_members.query({
      IndexName: 'teamMembersByPermission',
      KeyConditionExpression: '#permission = :permission',
      FilterExpression: 'teamId = :teamId AND #sub = :sub',
      ExpressionAttributeNames: {
        '#permission': 'permission',
        '#sub': 'sub',
      },
      ExpressionAttributeValues: {
        ':permission': permission,
        ':teamId': teamId,
        ':sub': sub,
      },
    })
  ).Items[0]

  return Boolean(membership)
}
