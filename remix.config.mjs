import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeClassNames from 'rehype-class-names'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

const isProduction = process.env.NODE_ENV === 'production'

// These packages only work in ESM mode, so we *must* bundle them
// (at least until we switch the serverModuleFormat to ESM).
const esmOnlyModules = ['github-slugger']

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
        rehypeClassNames({
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
  postcss: true,
  ignoredRouteFiles: ['**/.*'],
  assetsBuildDirectory: 'build/static',
  publicPath: '/_static/',
  server: './server.ts',
  serverBuildPath: 'build/server/index.js',
  serverMinify: isProduction,
  serverModuleFormat: 'cjs',
  serverDependenciesToBundle: [
    ...esmOnlyModules,
    ...(isProduction ? [/^(?!@?aws-sdk(\/|$))/] : []),
  ],
  future: {
    v2_dev: true,
    v2_headers: true,
    v2_meta: true,
    v2_errorBoundary: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
  },
}
