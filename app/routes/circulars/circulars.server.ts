/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { tables } from '@architect/functions'
import type { DynamoDB } from '@aws-sdk/client-dynamodb'
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { dynamoDBAutoIncrement } from '~/lib/dynamoDBAutoIncrement'
import { formatAuthor } from '../user/index'
import { getUser } from '../__auth/user.server'

export type CircularModel = {
  circularId: number
  sub?: string
  createdOn: number
  subject: string
  body: string
  submitter: string
}

export class CircularsServer {
  #sub?: string
  #email?: string
  #groups?: string[]
  #name?: string
  #affiliation?: string

  private constructor(
    sub?: string,
    email?: string,
    groups?: string[],
    name?: string,
    affiliation?: string
  ) {
    this.#affiliation = affiliation
    this.#email = email
    this.#groups = groups
    this.#name = name
    this.#sub = sub
  }

  static async create(request: Request) {
    const user = await getUser(request)
    return new this(
      user?.sub,
      user?.email,
      user?.groups,
      user?.name,
      user?.affiliation
    )
  }

  /**
   * Gets all available circulars
   * @param searchString - a string that will be checked against subjects,
   * bodies, and authors of saved circulars. A blank value returns all.
   * @returns an array of CircularModel objects
   */
  async getCirculars(searchString?: string) {
    let result = await this.#scanCircularsTable(searchString)
    let items: CircularModel[] = result.Items
    while (result.LastEvaluatedKey) {
      result = await this.#scanCircularsTable(
        searchString,
        result.LastEvaluatedKey
      )
      items = [...items, ...result.Items]
    }
    return items.sort((a, b) => b.circularId - a.circularId)
  }

  async #scanCircularsTable(searchString?: string, lastEvaluatedKey?: any) {
    const db = await tables()
    const result = await db.circulars.scan({
      ExclusiveStartKey: lastEvaluatedKey,
      ExpressionAttributeValues: searchString
        ? {
            ':searchTerm': searchString,
          }
        : undefined,
      FilterExpression: searchString
        ? 'contains(subject, :searchTerm) OR contains(body, :searchTerm) OR contains(submitter, :searchTerm)'
        : undefined,
    })
    return result
  }

  /**
   * Get a specified Circular by Id.
   *
   * Throws an HTTP error if:
   *  - the provided Id does not match any existing circulars
   *
   * @param id - the number Id (ex. 12345) of a specific Circular
   * @returns a CircularModel object
   */
  async get(circularId: number): Promise<CircularModel> {
    const db = await tables()
    const result = await db.circulars.get({
      circularId: circularId,
    })
    if (!result)
      throw new Response('The requested circular does not exist', {
        status: 404,
      })
    return result
  }

  /**
   * Adds a new entry into the GCN Circulars table
   *
   * Throws an HTTP error if:
   *  - The current user is not signed in, verified by the class's #sub and #groups properties
   *  - The current user is not in the submitters group
   *  - Body or Subject are blank
   * @param body - main content of the Circular
   * @param subject - the title/subject line of the Circular
   */
  async createNewCircular(body: string, subject: string) {
    if (!this.#sub || !this.#groups || !this.#email)
      throw new Response('User is not signed in', { status: 403 })
    if (!this.#groups.includes('gcn.nasa.gov/circular-submitter'))
      throw new Response('User is not in the submitters group', {
        status: 403,
      })
    if (!body || !subject)
      throw new Response('Subject and Body cannot be blank', { status: 400 })

    const db = await tables()
    const doc = db._doc as unknown as DynamoDBDocument

    const tableName = db.name('circulars')
    const indexTableName = db.name('auto_increment_metadata')

    const submitter = formatAuthor({
      name: this.#name,
      affiliation: this.#affiliation,
      email: this.#email,
    })

    const useDangerous =
      (await (db._db as unknown as DynamoDB).config.endpoint?.())?.hostname ==
      'localhost'

    await dynamoDBAutoIncrement({
      doc,
      counterTableName: indexTableName,
      counterTableKey: { tableName: 'circulars' },
      counterTableAttributeName: 'circularsIDCounter',
      tableName: tableName,
      tableAttributeName: 'circularId',
      initialValue: 1,
      dangerously: useDangerous,
    })({
      createdOn: Date.now(),
      subject,
      body,
      sub: this.#sub,
      submitter,
    })
  }

  /**
   * Gets all of the GCN Circualrs submitted by the current user.
   *
   * Throws and HTTP error if:
   *  - The current user is not signed in, verified by the class's #sub and #groups properties
   *
   * @returns an array of CircularModel objects
   */
  async getUserSubmittedCirculars() {
    if (!this.#sub) throw new Response('User is not signed in', { status: 403 })

    const db = await tables()
    const result = await db.circulars.scan({
      ExpressionAttributeNames: {
        '#sub': 'sub',
      },
      ExpressionAttributeValues: {
        ':sub': this.#sub,
      },
      FilterExpression: '#sub = :sub',
      ProjectionExpression:
        'subject, body, createdOn, circularId, #sub, submitter',
    })

    return result.Items as CircularModel[]
  }

  /**
   * Deletes the circular corresponding to the given circularId
   *
   * Throws an HTTP error if:
   *  - The current user is not signed in, verified by the class's #sub and #groups properties
   *  - The current user is not in the moderator group
   * @param circularId - the ID of the circular to be deleted
   */
  async deleteCircular(circularId: number) {
    if (!this.#sub || !this.#groups)
      throw new Response('User is not signed in', { status: 403 })

    if (!this.#groups.includes('gcn.nasa.gov/circular-moderator'))
      throw new Response('User is not a moderator', {
        status: 403,
      })

    const db = await tables()
    await db.circulars.delete({ circularId: circularId })
  }
}
