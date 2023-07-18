/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import type { Params } from '@remix-run/react'
import { SignJWT, jwtVerify } from 'jose'
import invariant from 'tiny-invariant'

import { maxTokenAge } from './jwt.lib'
import { getEnvOrDie, getOrigin } from '~/lib/env.server'

const key = new TextEncoder().encode(getEnvOrDie('SESSION_SECRET'))
const issuer = getOrigin()

type UnsubscribeOptions = {
  email: string
  topics: string[]
}

function isArrayOfStrings(obj: unknown): obj is string[] {
  return Array.isArray(obj) && obj.every((item) => typeof item === 'string')
}

/**
 * Generate an unsubscribe URL for the given email.
 */
export async function encodeToURL(options: UnsubscribeOptions) {
  const jwt = await new SignJWT(options)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(issuer)
    .sign(key)
  return `${issuer}/unsubscribe/${jwt}`
}

/**
 * Decode an unsubscribe token from data function args.
 */
export async function decodeFromURLParams({
  jwt,
}: Params): Promise<UnsubscribeOptions> {
  invariant(jwt)

  let jwtVerified
  try {
    jwtVerified = await jwtVerify(jwt, key, {
      maxTokenAge,
      issuer,
    })
  } catch (e) {
    console.error(e)
    throw new Response('invalid JWT', { status: 400 })
  }

  const { email, topics } = jwtVerified.payload
  invariant(typeof email === 'string')
  invariant(isArrayOfStrings(topics))

  return { email, topics }
}
