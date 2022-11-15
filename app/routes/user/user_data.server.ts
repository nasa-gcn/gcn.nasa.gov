/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { tables } from '@architect/functions'
import { getUser } from '../__auth/user.server'

export class UserDataServer {
  #sub: string

  private constructor(sub: string) {
    this.#sub = sub
  }

  static async create(request: Request) {
    const user = await getUser(request)
    if (!user) throw new Response('not signed in', { status: 403 })
    return new this(user.sub)
  }

  async updateUserData(displayName: string, affiliation: string) {
    const db = await tables()

    await db.user.update({
      Key: { sub: this.#sub },
      UpdateExpression:
        'set displayName = :displayName, affiliation = :affiliation',
      ExpressionAttributeValues: {
        ':displayName': displayName,
        ':affiliation': affiliation,
      },
    })
  }

  async getUserData() {
    const db = await tables()
    const results = await db.user.get({ sub: this.#sub })
    return results
  }
}
