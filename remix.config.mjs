import rehypeAddClasses from 'rehype-add-classes'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

/**
 * @type {import('@remix-run/dev/config').RemixMdxConfig}
 */
export const mdx = {
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
        a: 'usa-link',
        ol: 'usa-list',
        p: 'usa-paragraph',
        table: 'usa-table',
        ul: 'usa-list',
        ...options,
      }),
    (options) => rehypeAutolinkHeadings({ behavior: 'wrap', ...options }),
  ],
  remarkPlugins: [remarkGfm],
}

export const ignoredRouteFiles = ['**/.*', '**/*.lib.*']
export const assetsBuildDirectory = 'build/static'
export const publicPath = '/_static/'
export const server = './server.js'
export const serverBuildPath = 'build/server/index.js'
export const serverMinify = true
