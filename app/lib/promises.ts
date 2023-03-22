/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

/**
 * Return a promise that resolves after the given amount of time has elapsed.
 */
export async function sleep(timeoutMillis: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, timeoutMillis)
  })
}

/**
 * Return a promise that resolves when a function returns a truthy value.
 */
export async function until(
  func: () => Promise<boolean>,
  timeoutMillis: number
) {
  while (!(await func())) await sleep(timeoutMillis)
}
