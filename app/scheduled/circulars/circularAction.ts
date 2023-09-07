/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Circular } from '~/routes/circulars/circulars.lib'

export interface CircularAction<T = any> {
  initialize: () => T | Promise<T>
  action: (circulars: Circular[], context: T) => void | Promise<void>
  finalize: (context: T) => void | Promise<void>
}
