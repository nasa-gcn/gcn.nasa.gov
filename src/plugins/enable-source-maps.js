/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// Enable Node.js source map support.
export const set = {
  env() {
    return { NODE_OPTIONS: '--enable-source-maps' }
  },
}
