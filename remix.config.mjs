import rehypeAddClasses from 'rehype-add-classes'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

const isProduction = process.env.NODE_ENV === 'production'

/** @type {import('@remix-run/dev').AppConfig} */
export default {
  mdx: {
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
  },
  ignoredRouteFiles: ['**/.*', '**/*.lib.*', '**/*.server.*'],
  assetsBuildDirectory: 'build/static',
  publicPath: '/_static/',
  server: './server.ts',
  serverBuildPath: 'build/server/index.js',
  serverMinify: isProduction,
  serverDependenciesToBundle: isProduction
    ? [/^(?!@?aws-sdk(\/|$))/]
    : undefined,
  future: {
    v2_dev: true,
    v2_meta: true,
    v2_errorBoundary: true,
    v2_normalizeFormMethod: true,
  },
}
