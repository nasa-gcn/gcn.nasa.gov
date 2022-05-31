/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { storage } from './auth.server'

export async function getUser({ headers }: Request) {
  const session = await storage.getSession(headers.get('Cookie'))
  const subiss = session.get('subiss') as string | null
  const email = session.get('email') as string
  const groups = session.get('groups') as string[]

  if (!subiss) return null

  return { subiss, email, groups }
}
