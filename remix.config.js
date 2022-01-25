/**
 * @type {import('@remix-run/dev/config').RemixMdxConfigFunction}
 */
const mdx = async () => {
  const [rehypeAutolinkHeadings, rehypeHighlight, rehypeSlug, remarkGfm] =
    await Promise.all([
      import('rehype-autolink-headings')
        .then((mod) => mod.default)
        .then((func) => (options) => func({ behavior: 'wrap', ...options })),
      import('rehype-highlight').then((mod) => mod.default),
      import('rehype-slug').then((mod) => mod.default),
      import('remark-gfm').then((mod) => mod.default),
    ])

  return {
    rehypePlugins: [rehypeHighlight, rehypeSlug, rehypeAutolinkHeadings],
    remarkPlugins: [remarkGfm],
  }
}

/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */
module.exports = {
  appDirectory: 'app',
  assetsBuildDirectory: 'public/build',
  publicPath: '/_static/build/',
  serverBuildDirectory: 'src/build',
  devServerPort: 8002,
  mdx: mdx,
  ignoredRouteFiles: ['.*'],
}
