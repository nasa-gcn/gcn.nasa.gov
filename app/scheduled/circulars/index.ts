/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { forAllCirculars } from './actions'
import { statsAction } from './actions/stats'
import { jsonUploadAction, txtUploadAction } from './actions/tar'

// FIXME: must use module.exports here for OpenTelemetry shim to work correctly.
// See https://dev.to/heymarkkop/how-to-solve-cannot-redefine-property-handler-on-aws-lambda-3j67
module.exports.handler = async () => {
  await forAllCirculars(jsonUploadAction, txtUploadAction, statsAction)
}
