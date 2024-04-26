/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import {
  AdminAddUserToGroupCommand,
  AdminListGroupsForUserCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { dedent } from 'ts-dedent'

import { clearUserToken, getUser } from '../_auth/user.server'
import { group } from '../circulars/circulars.server'
import {
  cognito,
  extractAttribute,
  extractAttributeRequired,
  getCognitoUserFromSub,
  listUsersInGroup,
  maybeThrow,
} from '~/lib/cognito.server'
import { sendEmail } from '~/lib/email.server'
import { origin } from '~/lib/env.server'

const fromName = 'GCN Endorsements'
// Call-to-action
const endorsementsCTA = `

View your pending endorsements here: ${origin}/user/endorsements`

// models
export type EndorsementRequest = {
  endorserEmail: string
  endorserSub: string
  requestorEmail: string
  requestorSub: string
  created: number
  status: EndorsementState
  note?: string
}

export type EndorsementState = 'approved' | 'pending' | 'rejected' | 'reported'
export type EndorsementRole = 'endorser' | 'requestor'

export interface EndorsementUser {
  sub: string
  email: string
  name?: string
  affiliation?: string
}

export class EndorsementsServer {
  #sub: string
  #currentUserEmail: string
  #currentUserGroups: string[]

  private constructor(sub: string, requestorEmail: string, groups: string[]) {
    this.#sub = sub
    this.#currentUserEmail = requestorEmail
    this.#currentUserGroups = groups
  }

  userIsSubmitter() {
    return this.#currentUserGroups.includes(group)
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
  async createEndorsementRequest(endorserSub: string, note: string) {
    if (endorserSub === this.#sub)
      throw new Response(
        'Users cannot request themselves as the endorser of their own request',
        {
          status: 400,
        }
      )

    const user = await getCognitoUserFromSub(endorserSub)

    const { Groups } = await cognito.send(
      new AdminListGroupsForUserCommand({
        Username: user.Username,
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
      })
    )

    if (!Groups?.find(({ GroupName }) => GroupName === group))
      throw new Response('User is not in the submitters group', {
        status: 400,
      })

    const endorserEmail = extractAttributeRequired(user.Attributes, 'email')

    const db = await tables()

    await db.circular_endorsements.update({
      Key: {
        requestorSub: this.#sub,
        endorserSub,
      },
      UpdateExpression:
        'set #status = :status, endorserEmail = :endorserEmail, requestorEmail = :requestorEmail, created = :created, note = :note',
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
        ':note': note,
      },
      ConditionExpression:
        'NOT (endorserSub = :endorserSub and requestorSub = :requestorSub and #status <> :status)',
    })

    await sendEmail({
      fromName,
      to: [endorserEmail],
      subject: 'GCN Peer Endorsements: New Request',
      body: dedent`You have a new peer endorsement request for NASA's General Coordinates Network (GCN) from ${
        this.#currentUserEmail
      }.

      ${note && `Comments from the user: ${note}`}

      Approval of an endorsement means that the requestor, ${
        this.#currentUserEmail
      }, is in good standing with the astronomy community and will permit them to submit GCN circulars. In addition, they will also be able to receive endorsement requests from other users.

      Please approve this request if you are familiar with the requester, and agree with the criteria. Thank you for your contributions to the GCN community.

      If you are not familiar with this user, or believe it to be spam, you may reject or report the endorsement request.

      View all of your pending endorsement requests here: ${origin}/user/endorsements`,
    })
  }

  /**
   * Updates the Status of an existing Endorsement Request
   *
   * On approval, will clear out the requestor's token, and add them to the submitters group
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
    if (!this.userIsSubmitter())
      throw new Response(
        'The user is not a verified submitter, and therefore can not approve requests',
        {
          status: 400,
        }
      )

    const db = await tables()

    const requestorEmail: string = (
      await db.circular_endorsements.get({
        requestorSub,
        endorserSub: this.#sub,
      })
    )?.requestorEmail

    if (!requestorEmail)
      throw new Error(
        'Requestor email not found, malformed endorsement request in db'
      )

    await db.circular_endorsements.update({
      Key: {
        requestorSub,
        endorserSub: this.#sub,
      },
      UpdateExpression: 'set #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':pending': 'pending',
      },
      ConditionExpression: '#status = :pending',
    })

    const promiseArray: Promise<void>[] = []

    let requestorMessage = `You are receiving this email because the status of your peer endorsment requested from ${this.#currentUserEmail} has been updated to ${status}.`

    if (status === 'approved') {
      promiseArray.push(
        this.#addUserToGroup(requestorSub),
        clearUserToken(requestorSub)
      )
      requestorMessage +=
        `

      As an approved user, you may now submit GCN Circulars at ${origin}/circulars/new and be requested for endorsement by other users.` +
        endorsementsCTA
    } else if (status === 'reported')
      promiseArray.push(
        sendEmail({
          fromName,
          to: ['gcnkafka@lists.nasa.gov'],
          subject: 'GCN Peer Endorsements: Endorsement Request Reported',
          body: `${this.#currentUserEmail} has reported the endorsement request from ${requestorEmail}.`,
        })
      )
    else if (status == 'rejected') {
      requestorMessage += endorsementsCTA
    }
    promiseArray.push(
      sendEmail({
        fromName,
        to: [requestorEmail],
        subject: `GCN Peer Endorsements: Endorsement ${status}`,
        body: dedent(requestorMessage),
      }),
      sendEmail({
        fromName,
        to: [this.#currentUserEmail],
        subject: `GCN Peer Endorsements: Endorsement ${status}`,
        body:
          dedent`Your changes to ${requestorEmail}'s peer endorsement request have been processed. They will receive an email as well to confirm the new status.

        No further action is required on your part for this user's request.` +
          endorsementsCTA,
      })
    )

    await Promise.all(promiseArray)
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
        endorserSub,
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
  async getEndorsements(role: EndorsementRole): Promise<EndorsementRequest[]> {
    const db = await tables()
    const { Items } = await db.circular_endorsements.query({
      IndexName:
        role === 'requestor' ? undefined : 'circularEndorsementsByEndorserSub',
      KeyConditionExpression:
        role === 'requestor'
          ? 'requestorSub = :sub'
          : 'endorserSub = :endorserSub',
      FilterExpression: role === 'requestor' ? undefined : '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues:
        role === 'requestor'
          ? {
              ':sub': this.#sub,
            }
          : {
              ':endorserSub': this.#sub,
              ':status': 'pending',
            },
      ProjectionExpression:
        'requestorSub, requestorEmail, endorserSub, endorserEmail, #status, created, note',
    })
    return Items
  }

  /**
   * This should be used in future updates to create a list of valid users for
   * the current user to select from when creating a new endorsement request.
   *
   * @returns a list of users in the circular-submitter group,
   * not including the current user or an users from which endorsements have
   * already been requested.
   */
  async getSubmitterUsers() {
    const [users, requests] = await Promise.all([
      getUsersInGroup(),
      this.getEndorsements('requestor'),
    ])

    const excludedSubs = new Set([
      this.#sub,
      ...requests.map(({ endorserSub }) => endorserSub),
    ])

    return users.filter(({ sub }) => !excludedSubs.has(sub))
  }

  /**
   * Adds a user to the circulars submitters group
   *
   * Throws an HTTP error if:
   *  - The provided sub does not correspond to an existing user
   *
   * @param sub - sub of another user
   */
  async #addUserToGroup(sub: string) {
    const { Username } = await getCognitoUserFromSub(sub)

    await cognito.send(
      new AdminAddUserToGroupCommand({
        Username,
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        GroupName: group,
      })
    )
  }
}

async function getUsersInGroup(): Promise<EndorsementUser[]> {
  let users
  try {
    users = await listUsersInGroup(group)
  } catch (error) {
    maybeThrow(error, 'returning fake users')
    return [
      {
        sub: crypto.randomUUID(),
        email: 'a.einstein@example.com',
        name: 'Albert Einstein',
      },
      {
        sub: crypto.randomUUID(),
        email: 'c.sagan@example.com',
        name: 'Carl Sagan',
      },
    ]
  }

  return users.map(({ Attributes }) => ({
    sub: extractAttributeRequired(Attributes, 'sub'),
    email: extractAttributeRequired(Attributes, 'email'),
    name: extractAttribute(Attributes, 'name'),
    affiliation: extractAttribute(Attributes, 'custom:affiliation'),
  }))
}
