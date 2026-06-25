import { trace } from '@opentelemetry/api'
import {
  ATTR_HTTP_REQUEST_HEADER,
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_NETWORK_PEER_ADDRESS,
  ATTR_SERVER_ADDRESS,
  ATTR_URL_FULL,
  ATTR_URL_PATH,
  ATTR_URL_QUERY,
  ATTR_URL_SCHEME,
  ATTR_USER_AGENT_ORIGINAL,
} from '@opentelemetry/semantic-conventions'
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
  const span = trace.getActiveSpan()
  if (span) {
    const url = new URL(
      event.rawPath,
      `https://${event.requestContext.domainName}`
    )
    url.search = event.rawQueryString
    span.setAttributes({
      [ATTR_HTTP_REQUEST_METHOD]: event.requestContext.http.method,
      [ATTR_SERVER_ADDRESS]: event.requestContext.domainName,
      [ATTR_URL_FULL]: url.toString(), // todo
      [ATTR_URL_PATH]: event.rawPath,
      [ATTR_URL_SCHEME]: event.requestContext.http.protocol,
      [ATTR_URL_QUERY]: event.rawQueryString,
      [ATTR_NETWORK_PEER_ADDRESS]: event.requestContext.http.sourceIp,
      [ATTR_USER_AGENT_ORIGINAL]: event.requestContext.http.userAgent,
      ...Object.fromEntries(
        Object.entries(event.headers).map(([key, value]) => [
          ATTR_HTTP_REQUEST_HEADER(key),
          value,
        ])
      ),
    })
  }

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

  if (span && result.statusCode !== undefined)
    span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, result.statusCode)

  return result
}
