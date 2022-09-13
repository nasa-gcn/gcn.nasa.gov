/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { tables } from '@architect/functions'
import { validate } from 'email-validator'
import { getFormDataString } from '~/lib/utils'
import { getUser } from '../__auth/user.server'

// models
export type EndorsementRequest = {
  status: EndorsementStates
  endorserEmail?: string
  uuid?: string
  requestorEmail: string
}

export type EndorsementStates =
  | 'approved'
  | 'pending'
  | 'rejected'
  | 'unrequested'
  | 'reported'

export class EndorsementsServer {
  #sub: string
  #userEmail: string

  private constructor(sub: string, currentUserEmail: string) {
    this.#sub = sub
    this.#userEmail = currentUserEmail
  }
  static async create(request: Request) {
    const user = await getUser(request)
    if (!user)
      throw new Response('not signed in', {
        statusText: 'not signed in',
        status: 403,
      })
    return new this(user.sub, user.email)
  }

  async handleEndorsementCreateRequest(data: FormData) {
    this.createEndorsementRequest({
      endorserEmail: getFormDataString(data, 'reviewerEmail'),
      status: 'pending',
      requestorEmail: this.#userEmail,
    })
    return 'Success, now pending'
  }

  async handleEndorsementUpdateRequest(data: FormData) {
    this.updateUsersRequest({
      endorserEmail: getFormDataString(data, 'reviewerEmail'),
      status: 'pending',
      uuid: getFormDataString(data, 'requestId'),
      requestorEmail: this.#userEmail,
    })
    return 'Success, updated request'
  }

  async handleEndorsementStatusUpdate(id: string, intent: string) {
    this.updateUsersRequestStatus(id, intent)
  }

  #validateEndorsementRequest(request: EndorsementRequest) {
    if (
      !request.endorserEmail ||
      !validate(request.endorserEmail) ||
      !this.validEndorserEmail(request.endorserEmail)
    )
      throw new Response('email address is invalid', { status: 400 })
  }

  // #region Endorsements

  async createEndorsementRequest(request: EndorsementRequest) {
    this.#validateEndorsementRequest(request)

    const created = Date.now()
    const uuid = crypto.randomUUID()

    const db = await tables()
    await db.circular_permission_requests.put({
      sub: this.#sub, // User Id
      uuid, // Request Id
      status: request.status, // Approval state
      endorserEmail: request.endorserEmail, // User who will approve request
      requestorEmail: request.requestorEmail,
      created,
    })
  }

  async updateUsersRequest(request: EndorsementRequest) {
    this.#validateEndorsementRequest(request)
    const db = await tables()
    await db.circular_permission_requests.update({
      Key: {
        sub: this.#sub,
        uuid: request.uuid,
      },
      UpdateExpression:
        'set #endorserEmail = :newEndorserEmail, #status = :status',
      ExpressionAttributeNames: {
        '#endorserEmail': 'endorserEmail',
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':newEndorserEmail': request.endorserEmail,
        ':status': request.status,
      },
    })
  }

  async updateUsersRequestStatus(id: string, status: string) {
    const db = await tables()

    const result = await db.circular_permission_requests.query({
      IndexName: 'byUUID',
      KeyConditionExpression: '#uuid = :uuid',
      ExpressionAttributeNames: {
        '#sub': 'sub',
        '#uuid': 'uuid',
      },
      ExpressionAttributeValues: {
        ':uuid': id,
      },
      ProjectionExpression: '#uuid, #sub',
    })

    if (result.Items) {
      const requestItem = result.Items[0]

      await db.circular_permission_requests.update({
        Key: {
          sub: requestItem.sub,
          uuid: id,
        },
        UpdateExpression: 'set #status = :status',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': status,
        },
      })

      if (status == 'approved') {
        console.log('Cognito update here')
      }
    }
  }

  async getUsersEndorsementStatus(): Promise<EndorsementRequest> {
    const db = await tables()
    const result = await db.circular_permission_requests.query({
      KeyConditionExpression: '#sub = :sub',
      ExpressionAttributeNames: {
        '#sub': 'sub',
        '#uuid': 'uuid',
        '#endorserEmail': 'endorserEmail',
        '#status': 'status',
        '#requestorEmail': 'requestorEmail',
      },
      ExpressionAttributeValues: {
        ':sub': this.#sub,
      },
      ProjectionExpression: '#uuid , #endorserEmail, #status, #requestorEmail',
    })

    if (result.Items.length == 0) {
      return {
        status: 'unrequested',
        endorserEmail: '',
        uuid: '',
        requestorEmail: '',
      }
    } else {
      return result.Items[0]
    }
  }

  async getPendingEndorsementRequests() {
    const db = await tables()

    const result = await db.circular_permission_requests.query({
      IndexName: 'byEndorserEmail',
      KeyConditionExpression: '#endorserEmail = :endorserEmail',
      FilterExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#endorserEmail': 'endorserEmail',
        '#uuid': 'uuid',
        '#status': 'status',
        '#created': 'created',
        '#requestorEmail': 'requestorEmail',
      },
      ExpressionAttributeValues: {
        ':endorserEmail': this.#userEmail,
        ':status': 'pending',
      },
      ProjectionExpression:
        '#uuid, #status, #endorserEmail, #created, #requestorEmail',
    })

    return result.Items as EndorsementRequest[]
  }
  //#endregion
  // #region Notifications

  async getUsersCircularNotifications() {
    return []
  }

  async getCircularNotificationById(uuid: string) {
    return {}
  }

  async updateCircularEmailNotification() {
    console.log('Update Circular listener')
  }

  async createCircularEmailNotification(email?: string) {
    if (email) {
      const db = await tables()
      const main = db.circular_email_subscriptions.put({
        sub: this.#sub, // User Id
        email: email,
      })
      // Can probably just await main, no others called yet
      await main
    }
  }

  async getUserCircularNotificationSubscribedEmail() {
    const db = await tables()
    const result = await db.circular_email_subscriptions.query({
      KeyConditionExpression: '#sub = :sub',
      ExpressionAttributeNames: {
        '#sub': 'sub',
        '#email': 'email',
      },
      ExpressionAttributeValues: {
        ':sub': this.#sub,
      },
      ProjectionExpression: '#email, #sub',
    })
    if (result.Items.length == 0) {
      return {
        email: null,
      }
    } else {
      return result.Items[0]
    }
  }

  async deleteCircularEmailNotification() {
    const db = await tables()
    const item = await db.circular_email_subscriptions.get({
      sub: this.#sub,
    })
    if (!item) throw new Response(null, { status: 404 })
    await db.circular_email_subscriptions.delete({ sub: this.#sub })
  }
  //#endregion
  // #region Utility

  validEndorserEmail(email: string | undefined) {
    if (email == undefined) return false
    else if (email == this.#userEmail) {
      return false
    } else {
      const potentialReviewer = this.lookupEmail(email)
      if (!potentialReviewer || !potentialReviewer.canEndorse) {
        return false
      }
      return true
    }
  }
  lookupEmail(email: string) {
    // Hook this up later
    return { canEndorse: true }
  }
  //#endregion
}
