/**
 * @type {import('@remix-run/dev/config').RemixMdxConfigFunction}
 */
const mdx = async () => {
  const [rehypeHighlight] = await Promise.all([
    import("rehype-highlight").then(mod => mod.default)
  ]);

  return {
    rehypePlugins: [rehypeHighlight]
  };
};

/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */
module.exports = {
  appDirectory: "app",
  assetsBuildDirectory: "public/build",
  publicPath: "/build/",
  serverBuildDirectory: "build",
  devServerPort: 8002,
  mdx: mdx,
  ignoredRouteFiles: [".*"]
};
