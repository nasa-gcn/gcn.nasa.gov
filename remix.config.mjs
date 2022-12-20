import rehypeAddClasses from 'rehype-add-classes'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

/**
 * @type {import('@remix-run/dev/config').RemixMdxConfigFunction}
 */
export async function mdx() {
  return {
    rehypePlugins: [
      rehypeHighlight,
      rehypeSlug,
      (options) =>
        rehypeExternalLinks({
          rel: 'external',
          target: false,
          ...options,
        }),
      (options) =>
        rehypeAddClasses({
          table: 'usa-table',
          a: 'usa-link',
          ...options,
        }),
      (options) => rehypeAutolinkHeadings({ behavior: 'wrap', ...options }),
    ],
    remarkPlugins: [remarkGfm],
  }
}

export const serverBuildTarget = 'arc'
export const server = './server.js'
export const ignoredRouteFiles = ['**/.*']
