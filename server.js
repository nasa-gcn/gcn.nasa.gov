import { createRequestHandler } from '@remix-run/architect'
import * as build from '@remix-run/dev/server-build'

const handler = createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
})

// FIXME: must use module.exports here for OpenTelemetry shim to work correctly.
// See https://dev.to/heymarkkop/how-to-solve-cannot-redefine-property-handler-on-aws-lambda-3j67
module.exports.handler = async function (event, context) {
  // Tell Lambda runtime to send response to invoker immediately without
  // waiting for pending callbacks to finish. I suspect that OpenTelemetry was
  // blocking responses.
  context.callbackWaitsForEmptyEventLoop = false
  return await handler(event)
}
