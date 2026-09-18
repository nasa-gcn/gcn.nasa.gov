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
  // topicId: string
  permission: Permission
}

export type FullMemberInfo = TeamMember & {
  email?: string
  groups?: string[]
  username?: string
  // affiliation?: string
}

export type TeamInvite = {
  teamId: string
  sub: string
  topicId: string
  permission: Permission
}

export type TeamInviteWithEmail = TeamInvite & {
  email: string
}

export type Topic = {
  topicId: string
  topicName: string
  isPublic: boolean
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
  if (!(await userHasPermission(user.sub, 'gcn.nasa.gov', 'admin')))
    throw new Response(null, { status: 403 })

  const db = await tables()
  const team: Team = {
    teamId: crypto.randomUUID(),
    teamName,
    description,
  }
  await db.teams.put(team)
  const topic = await createTopic(topicName, team.teamId)
  // TODO: Add KafkaACL functions here once they are created

  await Promise.all([
    db.team_invites.put({
      teamId: team.teamId,
      email: pocEmail,
      topicId: topic.topicId,
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

// TODO: Rework teams-topic relation, teams get 1-1 association to topic spaces
export async function getTeamTopics(teamId: string) {
  const db = await tables()
  return (
    await db.topics.query({
      IndexName: 'topicsByTeamId',
      KeyConditionExpression: 'teamId = :teamId',
      ExpressionAttributeValues: {
        ':teamId': teamId,
      },
    })
  ).Items as Topic[]
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
  console.log('inviteUserToTeam', { user, teamId, newUserSub, permission })
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
  const db = await tables()
  await db.team_members.put({
    sub,
    teamId,
    permission,
  })
}

export async function removeUserFromTeam(sub: string, teamId: string) {
  const db = await tables()
  // Check that we are not about to delete the only team admin
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
  // So long as there is at least another admin, we may delete the user
  if (!admins.some((user) => user.sub !== sub)) {
    throw new Response(null, { status: 400 })
  }
  await db.team_members.delete({ sub, teamId })
}

// #region Topic Functions

export async function createTopic(topicName: string, teamId: string) {
  const db = await tables()
  const topic: Topic = {
    topicId: crypto.randomUUID(),
    topicName,
    isPublic: false,
    teamId,
  }
  await db.topics.put(topic)
  return topic
}

export async function getTopic(topicId: string): Promise<Topic> {
  const db = await tables()
  return await db.topics.get({ topicId })
}

export async function updateTopicPublicAvailability(
  topicId: string,
  isPublic: boolean
) {
  // TODO: Add KafkaACL function to add public rule
  const db = await tables()
  await db.topics.update({
    Key: { topicId },
    UpdateExpression: 'set #public = :public',
    ExpressionAttributeNames: {
      '#public': 'public',
    },
    ExpressionAttributeValues: {
      ':public': isPublic,
    },
  })
}

export async function deleteTopic(topicId: string) {
  const db = await tables()
  await db.topics.delete({ topicId })
  const memberships: TeamMember[] = (
    await db.team_members.query({
      IndexName: 'membersByTopicId',
      KeyConditionExpression: 'topicId = :topicId',
      ExpressionAttributeValues: {
        ':topicId': topicId,
      },
    })
  ).Items

  const client = db._doc as unknown as DynamoDBDocument
  const TableName = db.name('team_members')
  await client.batchWrite({
    RequestItems: {
      [TableName]: memberships.map((x) => ({
        DeleteRequest: {
          Key: {
            sub: { S: x.sub },
            teamId: { S: x.teamId },
          },
        },
      })),
    },
  })
  // TODO: Add KafkaACL function here to remove rules for this topic
}

// TODO: Does this still make sense? I dont think so
export async function userHasPermission(
  sub: string,
  topicName: string,
  permission: Permission
): Promise<boolean> {
  const db = await tables()
  const topicId: string = (
    await db.topics.query({
      IndexName: 'topicsByName',
      KeyConditionExpression: 'topicName = :topicName',
      ExpressionAttributeValues: {
        ':topicName': topicName,
      },
    })
  ).Items[0].topicId

  const membership = (
    await db.team_members.query({
      IndexName: 'membersByTopicId',
      KeyConditionExpression: 'topicId = :topicId',
      FilterExpression: '#sub = :sub AND permission = :permission',
      ExpressionAttributeNames: {
        '#sub': 'sub',
      },
      ExpressionAttributeValues: {
        ':sub': sub,
        ':topicId': topicId,
        ':permission': permission,
      },
    })
  ).Items[0]
  return Boolean(membership)
}
// #endregion
