/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Circular } from '~/routes/circulars/circulars.lib'

export interface CircularAction {
  initialize: () => Promise<object>
  action: (circulars: Circular[], context: object) => Promise<void>
  finalize: (context: object) => Promise<void>
}
