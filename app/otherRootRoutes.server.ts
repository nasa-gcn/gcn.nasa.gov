import { generateRobotsTxt, generateSitemap } from '@balavishnuvj/remix-seo'
import type { EntryContext } from '@remix-run/server-runtime'

import { origin } from './lib/env.server'
import { publicStaticShortTermCacheControlHeaders } from './lib/headers.server'

type Handler = (
  request: Request,
  remixContext: EntryContext
) => Promise<Response | null> | null

export const otherRootRoutes: Record<string, Handler> = {
  '/sitemap/main': async (request, remixContext) => {
    return generateSitemap(request, remixContext, {
      siteUrl: origin,
      headers: publicStaticShortTermCacheControlHeaders,
    })
  },
  '/robots.txt': async () => {
    return generateRobotsTxt([
      { type: 'sitemap', value: `${origin}/sitemap` },
      { type: 'disallow', value: '/user' },
    ])
  },
}

export const otherRootRouteHandlers: Array<Handler> = [
  ...Object.entries(otherRootRoutes).map(([path, handler]) => {
    return (request: Request, remixContext: EntryContext) => {
      if (new URL(request.url).pathname !== path) return null
      return handler(request, remixContext)
    }
  }),
]
