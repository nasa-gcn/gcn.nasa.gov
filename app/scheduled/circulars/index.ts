/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { forAllCirculars } from './actions'
import { sitemapAction } from './actions/sitemap'
import { statsAction } from './actions/stats'
import { jsonUploadAction, txtUploadAction } from './actions/tar'

// Export handler entrypoint for instrumentation with OpenTelemetry.
// From https://aws-otel.github.io/docs/getting-started/lambda/lambda-js#requirements:
//
// > For TypeScript users, if you are using esbuild (either directly or through
// > tools such as the AWS CDK), you must export your handler function through
// > module.exports rather than with the export keyword! The AWS mananaged layer
// > for ADOT JavaScript needs to hot-patch your handler at runtime, but can't
// > because esbuild makes your handler immutable when using the export keyword.
module.exports.handler = async function() {
  await forAllCirculars(
    jsonUploadAction,
    txtUploadAction,
    statsAction,
    sitemapAction
  )
}
