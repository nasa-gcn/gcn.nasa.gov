import { createRequestHandler } from '@remix-run/architect'
import * as build from '@remix-run/dev/server-build'
import { installGlobals } from '@remix-run/node'

installGlobals()

// FIXME: must use module.exports here for OpenTelemetry shim to work correctly.
// See https://dev.to/heymarkkop/how-to-solve-cannot-redefine-property-handler-on-aws-lambda-3j67
module.exports.handler = createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
})
