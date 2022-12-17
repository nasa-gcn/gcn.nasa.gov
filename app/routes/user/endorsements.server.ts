/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { tables } from '@architect/functions'
import {
  AdminListGroupsForUserCommand,
  ListUsersCommand,
  ListUsersInGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { getUser } from '../__auth/user.server'
import { client } from './cognito.server'

// models
export type EndorsementRequest = {
  endorserEmail: string
  endorserSub: string
  requestorEmail: string
  requestorSub: string
  created: number
  status: EndorsementState
}

export type EndorsementState = 'approved' | 'pending' | 'rejected' | 'reported'

export class EndorsementsServer {
  #sub: string
  #currentUserEmail: string
  #currentUserGroups: string[]

  private constructor(sub: string, requestorEmail: string, groups: string[]) {
    this.#sub = sub
    this.#currentUserEmail = requestorEmail
    this.#currentUserGroups = groups
  }

  static async create(request: Request) {
    const user = await getUser(request)
    if (!user)
      throw new Response('Forbidden', {
        status: 403,
      })
    return new this(user.sub, user.email, user.groups)
  }

  /**
   * Request a pending endorsement.
   *
   * Throws an HTTP error if:
   *   - The requested endorser is the same as the current user
   *   - User `endorserSub` does not exist
   *   - User `endorserSub` is not in the GCN Circulars submitters group
   *   - User `endorserSub` does not have an email attribute
   *   - There is an existing endorsement with the same requester and submitter sub
   */
  async createEndorsementRequest(endorserSub: string) {
    if (endorserSub === this.#sub)
      throw new Response(
        'Users cannot request themselves as the endorser of their own request',
        {
          status: 400,
        }
      )

    const escapedEndorserString = endorserSub.replaceAll('"', '\\"')
    const user = (
      await client.send(
        new ListUsersCommand({
          UserPoolId: process.env.COGNITO_USER_POOL_ID,
          Filter: `sub = "${escapedEndorserString}"`,
        })
      )
    )?.Users?.[0]
    if (!user)
      throw new Response('Requested user does not exist', {
        status: 400,
      })

    const getGroupsCommand = new AdminListGroupsForUserCommand({
      Username: user.Username,
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
    })
    const groupsResponse = await client.send(getGroupsCommand)

    if (
      !groupsResponse.Groups?.find(
        ({ GroupName }) => GroupName === 'gcn.nasa.gov/circular-submitter'
      )
    )
      throw new Response('User is not in the submitters group', {
        status: 400,
      })

    const endorserEmail = user.Attributes?.find((x) => x.Name == 'email')?.Value
    if (!endorserEmail)
      throw new Response('Requested user does not have an email', {
        status: 400,
      })

    const db = await tables()

    await db.circular_endorsements.update({
      Key: {
        requestorSub: this.#sub,
        endorserSub: escapedEndorserString,
      },
      UpdateExpression:
        'set #status = :status, endorserEmail = :endorserEmail, requestorEmail = :requestorEmail, created = :created',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': 'pending',
        ':endorserEmail': endorserEmail,
        ':requestorEmail': this.#currentUserEmail,
        ':created': Date.now(),
        ':endorserSub': endorserSub,
        ':requestorSub': this.#sub,
      },
      ConditionExpression:
        'NOT (endorserSub = :endorserSub and requestorSub = :requestorSub)',
    })
  }

  /**
   * Updates the Status of an existing Endorsement Request
   *
   * Throws an HTTP error if:
   *    - The current user is not in the submitters group
   *    - There is not an existing endorsement request with a key matching the provided requestorSub, the sub of the current
   * user as the endorserSub, and the status of that request is 'pending'.
   * @param status - the new status to be set
   * @param requestorSub - the sub of the user who requested the endorsement
   */
  async updateEndorsementRequestStatus(
    status: EndorsementState,
    requestorSub: string
  ) {
    if (
      this.#currentUserGroups.indexOf('gcn.nasa.gov/circular-submitter') == -1
    )
      throw new Response(
        'The user is not a verified submitter, and therefore can not approve requests',
        {
          status: 400,
        }
      )

    const db = await tables()
    await db.circular_endorsements.update({
      Key: {
        requestorSub: requestorSub,
        endorserSub: this.#sub,
      },
      UpdateExpression: 'set #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': status,
      },
      ConditionExpression: "#status = 'pending'",
    })
  }

  /**
   * Allows the current user to delete the existing endorsement request corresponding to
   * the provided endorserSub.
   * @param endorserSub - the sub of the listed endorser on the existing request
   */
  async deleteEndorsementRequest(endorserSub: string) {
    const db = await tables()
    const tableName = db.name('circular_endorsements')

    const param = {
      Key: {
        requestorSub: this.#sub,
        endorserSub: endorserSub,
      },
      TableName: tableName,
      ConditionExpression: '#status = :pendingStatus',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':pendingStatus': 'pending',
      },
    }

    // FIXME: https://github.com/architect/functions/issues/540
    await (db._doc as unknown as DynamoDBDocument).delete(param)
  }

  /**
   * Gets all of the current endorsements requests for a given user based on role
   *
   *  - 'endorser' returns all requests from other users in which the current user is the listed Endorser
   *  - 'requestor' returns all requests which the current user has made
   * @param role - the role of the current user to set the context of the query
   * @returns an array of the EndorsementRequest object
   */
  async getEndorsements(
    role: 'endorser' | 'requestor'
  ): Promise<EndorsementRequest[]> {
    const queryParams = {
      IndexName:
        role == 'requestor' ? undefined : 'circularEndorsementsByEndorserSub',
      KeyConditionExpression:
        role == 'requestor'
          ? 'requestorSub = :sub'
          : 'endorserSub = :endorserSub',
      FilterExpression: role == 'requestor' ? undefined : '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues:
        role == 'requestor'
          ? {
              ':sub': this.#sub,
            }
          : {
              ':endorserSub': this.#sub,
              ':status': 'pending',
            },
      ProjectionExpression:
        'requestorSub, requestorEmail, endorserSub, endorserEmail, #status, created',
    }

    const db = await tables()
    const result = await db.circular_endorsements.query(queryParams)
    return result.Items as EndorsementRequest[]
  }

  /**
   * This should be used in future updates to create a list of valid users for
   * the current user to select from when creating a new endorsement request.
   *
   * @returns a list of users in the circular-submitter group.
   */
  async getSubmitterUsers() {
    const command = new ListUsersInGroupCommand({
      GroupName: 'gcn.nasa.gov/circular-submitter',
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
    })
    const result = await client.send(command)
    return result.Users
  }
}
