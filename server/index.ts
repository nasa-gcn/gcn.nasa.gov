import { createRequestHandler } from '@remix-run/architect'

// @ts-expect-error: omitted getLoadContext parameter should be optional.
// See https://github.com/remix-run/remix/pull/1643
export const handler = createRequestHandler({
  build: require('./build'),
})
