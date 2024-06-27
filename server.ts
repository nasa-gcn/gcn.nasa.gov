import { type RequestHandler, createRequestHandler } from '@remix-run/architect'
import * as build from '@remix-run/dev/server-build'
import { installGlobals } from '@remix-run/node'
import sourceMapSupport from 'source-map-support'

sourceMapSupport.install()
installGlobals({ nativeFetch: true })

const remixHandler = createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
})

const { CDN_SECRET } = process.env

export const handler: RequestHandler = (event, ...args) => {
  if (CDN_SECRET && event.headers['x-cdn-secret'] !== CDN_SECRET)
    // FIXME: this shouldn't need to be a promise.
    // See https://github.com/DefinitelyTyped/DefinitelyTyped/pull/69466
    return Promise.resolve({ statusCode: 502 })
  return remixHandler(event, ...args)
}
