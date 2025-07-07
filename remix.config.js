import properties from 'highlight.js/lib/languages/properties'
import { common } from 'lowlight'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeCitation from 'rehype-citation'
import rehypeClassNames from 'rehype-class-names'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeHighlight from 'rehype-highlight'
import rehypeMermaid from 'rehype-mermaid'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

const isProduction = process.env.NODE_ENV === 'production'

// These packages only work in ESM mode, so we *must* bundle them
// (at least until we switch the serverModuleFormat to ESM).
const esmOnlyModules = [
  '@nasa-gcn/remark-rehype-astro',
  'bail',
  'before-after-hook',
  'bcp-47-match',
  'ccount',
  'character-entities',
  'comma-separated-tokens',
  'decode-named-character-reference',
  'devlop',
  'direction',
  'escape-string-regexp',
  'github-slugger',
  'is-plain-obj',
  'markdown-table',
  'pretty-bytes',
  'property-information',
  'space-separated-tokens',
  'trim-lines',
  'trough',
  'unified',
  'universal-user-agent',
  'web-namespaces',
  'zwitch',
  /^@octokit/,
  /^hast/,
  /^mdast/,
  /^micromark/,
  /^rehype/,
  /^remark/,
  /^unist/,
  /^vfile/,
]

// These packages should never be bundled.
const neverBundledModules = [
  // Included in AWS Lambda base image
  /@?aws-sdk(?:\/|$)/,
  // Used to polyfill Web Fetch; not needed for Node.js >= 20
  'undici',
  '@remix-run/web-fetch',
]

/** @type {import('@remix-run/dev').AppConfig} */
export default {
  mdx: {
    rehypePlugins: [
      rehypeMermaid,
      (options) => rehypeHighlight({ ...common, properties }),
      rehypeSlug,
      (options) =>
        rehypeExternalLinks({
          rel: ['external', 'noopener'],
          target: '_blank',
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
      (options) =>
        rehypeCitation({
          bibliography: 'references.bib',
          linkCitations: true,
          ...options,
        }),
    ],
    remarkPlugins: [remarkGfm],
  },
  postcss: true,
  ignoredRouteFiles: ['**/.*'],
  assetsBuildDirectory: 'build/static',
  publicPath: '/_static/app/',
  server: './server.ts',
  serverBuildPath: 'build/server/index.cjs',
  serverMinify: isProduction,
  serverModuleFormat: 'cjs',
  serverDependenciesToBundle: [
    ...esmOnlyModules,
    ...(isProduction
      ? [
          new RegExp(
            `^(?!${neverBundledModules
              .map((item) => (item instanceof RegExp ? item.source : item))
              .join('|')})`
          ),
        ]
      : []),
  ],
  future: { v3_relativeSplatPath: true },
}
