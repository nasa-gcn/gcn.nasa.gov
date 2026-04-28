/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

export type Team = {
  teamId: string
  teamName: string
  description: String
}

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
  permission: 'admin' | 'write' | 'read'
}

export type Topic = {
  topicId: string
  topicName: string
  public: boolean
  teamId: string
}
