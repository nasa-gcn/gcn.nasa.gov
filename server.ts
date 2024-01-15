import { createRequestHandler } from '@remix-run/architect'
import * as build from '@remix-run/dev/server-build'
import { installGlobals } from '@remix-run/node'
import sourceMapSupport from 'source-map-support'

sourceMapSupport.install()
installGlobals()

export const handler = createRequestHandler({
  //@ts-expect-error: see https://github.com/remix-run/remix/pull/8492
  build,
  mode: process.env.NODE_ENV,
})
