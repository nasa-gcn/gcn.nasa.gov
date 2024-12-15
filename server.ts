import { type RequestHandler, createRequestHandler } from '@remix-run/architect'
import * as build from '@remix-run/dev/server-build'
import { type APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import sourceMapSupport from 'source-map-support'

sourceMapSupport.install()

const remixHandler = createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
})

const { CDN_SECRET } = process.env

export const handler: RequestHandler = async (event, ...args) => {
  if (CDN_SECRET && event.headers['x-cdn-secret'] !== CDN_SECRET)
    // FIXME: this shouldn't need to be a promise.
    // See https://github.com/DefinitelyTyped/DefinitelyTyped/pull/69466
    return Promise.resolve({ statusCode: 502 })

  // By default, don't cache responses.
  // This prevents us from showing stale pages. For example, if the user
  // logs out and then clicks the "back" button, they should not see a page
  // that looks like they are still logged in.
  const result = (await remixHandler(
    event,
    ...args
  )) as APIGatewayProxyStructuredResultV2
  ;(result.headers ??= {})['Cache-Control'] ??= 'max-age=0, no-store'
  return result
}
