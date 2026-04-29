/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import crypto from 'crypto'
import { dedent } from 'ts-dedent'

import { sendEmail } from './email.server'
import { origin } from './env.server'
import type { User } from '~/routes/_auth/user.server'

const fromName = 'GCN Teams'

export type Team = {
  teamId: string
  teamName: string
  description: String
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
  topicId: string
  permission: Permission
}

export type TeamInvite = {
  teamId: string
  email: string
  topicId: string
  permission: Permission
}

export type Topic = {
  topicId: string
  topicName: string
  public: boolean
  teamId: string
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
  pocEmail: string,
  topicName: string
) {
  if (!user.groups.includes('gcn.nasa.gov/gcn-admin'))
    throw new Response(null, { status: 403 })

  const db = await tables()
  const team: Team = {
    teamId: crypto.randomUUID(),
    teamName,
    description,
  }
  await db.teams.put(team)
  const topic: Topic = {
    topicId: crypto.randomUUID(),
    topicName,
    public: false,
    teamId: team.teamId,
  }
  await db.topics.put(topic)
  await db.team_invites.put({
    teamId: team.teamId,
    email: pocEmail,
    topicId: topic.topicId,
    permission: 'admin',
  })

  await sendEmail({
    fromName,
    to: [pocEmail],
    subject: 'GCN Team Admin Invite',
    body: dedent`You have been added as a team admin to ${teamName}. 
    
    To continue, go to ${origin}/teams and accept the invite. Once complete, you will be able to invite other users to join your team.`,
  })

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

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const db = await tables()
  return (
    await db.team_members.query({
      KeyConditionExpression: 'teamId = :teamId',
      IndexName: 'usersByTeam',
      ExpressionAttributeValues: {
        ':teamId': teamId,
      },
    })
  ).Items as TeamMember[]
}

export async function getTeamInvites(teamId: string) {
  const db = await tables()
  return (
    await db.team_invites.query({
      KeyConditionExpression: 'teamId = :teamId',
      ExpressionAttributeValues: {
        ':teamId': teamId,
      },
    })
  ).Items as TeamInvite[]
}

export async function updateTeam(
  teamId: string,
  teamName: string,
  description: string
) {
  const db = await tables()
  await db.teams.update({
    Key: { teamId },
    UpdateExpression: 'set #teamName = :teamName, #description = :description',
    ExpressionAttributeNames: {
      '#teamName': 'teamName',
      '#description': 'description',
    },
    ExpressionAttributeValues: {
      ':teamName': teamName,
      ':description': description,
    },
  })
}

export async function deleteTeam(teamId: string) {
  const db = await tables()

  await db.teams.delete({ teamId })
  const team_members = await getTeamMembers(teamId)
  const team_invites = await getTeamInvites(teamId)

  await Promise.all([
    ...team_members.map((x) => db.team_members.delete({ sub: x.sub, teamId })),
    ...team_invites.map((x) =>
      db.team_invites.delete({ teamId, email: x.email })
    ),
  ])
}

export async function inviteUserToTeam(
  user: User,
  teamId: string,
  newUserEmail: string,
  topicId: string,
  permission: Permission
) {
  const db = await tables()
  const userPermission = (await db.team_members.get({
    teamId,
    sub: user.sub,
  })) as TeamMember
  if (userPermission.permission != 'admin')
    throw new Response(null, { status: 403 })
  const team = (await db.teams.get({ teamId })) as Team
  if (!team) throw new Response(null, { status: 404 })

  await db.team_invites.put({
    teamId,
    email: newUserEmail,
    topicId,
    permission,
  })

  await sendEmail({
    to: [newUserEmail],
    fromName,
    subject: `GCN Teams Invite: ${team.teamName}`,
    body: dedent`You have been invited to join ${team.teamName} by ${user.name}. 
    To accept, go to ${origin}/teams and accept the invite. Once complete, you will be able to create client credentials to 
    produce and/or consume Kafka messages, as determined by your team admin.`,
  })
}

export async function getInvitesForUser(user: User) {
  const db = await tables()
  return (
    await db.team_invites.query({
      KeyConditionExpression: 'email = :email',
      IndexName: 'invitesByEmail',
      ExpressionAttributeValues: {
        ':email': user.email,
      },
    })
  ).Items as TeamInvite[]
}

export async function deleteTeamInvite(teamId: string, email: string) {
  const db = await tables()
  await db.team_invites.delete({ teamId, email })
}

export async function acceptTeamInvite(user: User, teamId: string) {
  const db = await tables()
  const invite: TeamInvite = await db.team_invites.get({
    teamId,
    email: user.email,
  })
  if (!invite) throw new Response(null, { status: 404 })
  await setUsersTeamPermission(
    user.sub,
    teamId,
    invite.topicId,
    invite.permission
  )
  await deleteTeamInvite(teamId, user.email)
}

export async function setUsersTeamPermission(
  sub: string,
  teamId: string,
  topicId: string,
  permission: Permission
) {
  const db = await tables()
  await db.team_members.put({
    sub,
    teamId,
    topicId,
    permission,
  })
}

export async function removeUserFromTeam(sub: string, teamId: string) {
  const db = await tables()
  await db.team_members.delete({ sub, teamId })
}
