/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

// Workaround for Remix live reload bug, https://github.com/remix-run/remix/issues/198
export const set = {
  env() {
    return { testing: { NODE_ENV: 'development' } }
  },
}
