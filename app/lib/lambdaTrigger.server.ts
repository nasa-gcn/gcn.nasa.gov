/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// Type guarding to get around an error when trying to access `reason`
const isRejected = (
  input: PromiseSettledResult<unknown>
): input is PromiseRejectedResult => input.status === 'rejected'

/**
 * Create a Lambda trigger handler that handles event records concurrently,
 * asynchronously.
 */
export function createTriggerHandler<T>(
  recordHandler: (record: T) => Promise<void>
) {
  return async (event: { Records: T[] }) => {
    await allSettledOrRaise(event.Records.map(recordHandler))
  }
}

/**
 * Execute a collection of promises.
 * Resolve when all of the promises have resolved,
 * or reject when all of the promises have settled and any of the promises have
 * rejected.
 */
export async function allSettledOrRaise<T extends readonly unknown[]>(
  promises: T
) {
  const results = await Promise.allSettled(promises)
  const rejections = results.filter(isRejected).map(({ reason }) => reason)
  if (rejections.length) throw rejections
  return (
    results as {
      -readonly [P in keyof T]: PromiseFulfilledResult<Awaited<T[P]>>
    }
  ).map(({ value }) => value) as { -readonly [P in keyof T]: Awaited<T[P]> }
}
