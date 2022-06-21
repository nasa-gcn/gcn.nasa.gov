/**
 * @type {import('@remix-run/dev/config').RemixMdxConfigFunction}
 */
const mdx = async () => {
  const [
    rehypeAddClasses,
    rehypeAutolinkHeadings,
    rehypeExternalLinks,
    rehypeHighlight,
    rehypeSlug,
    remarkGfm,
  ] = await Promise.all([
    import('rehype-add-classes')
      .then((mod) => mod.default)
      .then(
        (func) => (options) =>
          func({
            table: 'usa-table',
            a: 'usa-link',
            ...options,
          })
      ),
    import('rehype-autolink-headings')
      .then((mod) => mod.default)
      .then((func) => (options) => func({ behavior: 'wrap', ...options })),
    import('rehype-external-links')
      .then((mod) => mod.default)
      .then(
        (func) => (options) =>
          func({
            rel: 'external',
            target: false,
            ...options,
          })
      ),
    import('rehype-highlight').then((mod) => mod.default),
    import('rehype-slug').then((mod) => mod.default),
    import('remark-gfm').then((mod) => mod.default),
  ])

  return {
    rehypePlugins: [
      rehypeHighlight,
      rehypeSlug,
      rehypeExternalLinks,
      rehypeAddClasses,
      rehypeAutolinkHeadings,
    ],
    remarkPlugins: [remarkGfm],
  }
}

/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */
module.exports = {
  serverBuildTarget: 'arc',
  server: './server.js',
  ignoredRouteFiles: ['.*'],
  mdx: mdx,
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "server/index.js",
  // publicPath: "/_static/build/"
}
