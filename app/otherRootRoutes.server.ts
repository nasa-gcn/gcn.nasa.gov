import { generateRobotsTxt, generateSitemap } from '@balavishnuvj/remix-seo'
import type { EntryContext } from '@remix-run/server-runtime'

type Handler = (
  request: Request,
  remixContext: EntryContext
) => Promise<Response | null> | null

export const otherRootRoutes: Record<string, Handler> = {
  '/sitemap.xml': async (request, remixContext) => {
    const origin = new URL(request.url).origin
    return generateSitemap(request, remixContext, {
      siteUrl: origin,
      headers: {
        'Cache-Control': `public, max-age=${60 * 5}`,
      },
    })
  },
  '/robots.txt': async (request) => {
    const origin = new URL(request.url).origin
    return generateRobotsTxt([
      { type: 'sitemap', value: `${origin}/sitemap.xml` },
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
