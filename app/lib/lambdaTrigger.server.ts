/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
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
    const results = await Promise.allSettled(event.Records.map(recordHandler))
    const rejections = results.filter(isRejected).map(({ reason }) => reason)
    if (rejections.length) throw rejections
  }
}
