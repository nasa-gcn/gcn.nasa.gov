import esbuild from 'esbuild'
import { copyFile, unlink, writeFile } from 'fs/promises'
import { glob } from 'glob'
import { extname } from 'node:path'
import { basename, dirname, join } from 'path'

const args = process.argv.slice(2)
const dev = args.includes('--dev')
const entryPoints = await glob(
  './app/{email-incoming,scheduled,table-streams}/*/index.ts'
)

/**
 * @type {esbuild.BuildOptions}
 */
const options = {
  bundle: true,
  entryPoints,
  logLevel: 'info',
  outdir: 'build',
  outbase: 'app',
  outExtension: { '.js': '.cjs' },
  external: ['@aws-sdk/*', 'aws-sdk'],
  platform: 'node',
  target: ['node20'],
  minify: !dev,
  sourcemap: dev,
  metafile: true,
  loader: { '.node': 'copy' },
  publicPath: './',
  plugins: [
    {
      name: 'copy Node API modules to output directories',
      setup(build) {
        const resolving = Symbol('resolving')
        build.onResolve(
          { filter: /\.node$/ },
          async ({ path, pluginData, ...resolveOptions }) => {
            // Skip .node modules that don't exist. @mongodb-js/zstd tries to
            // import Release/zstd.node and falls back to Debug/zstd.node; the
            // latter does not exist on production builds.
            if (pluginData === resolving) return
            const result = await build.resolve(path, {
              ...resolveOptions,
              pluginData: resolving,
            })
            if (result.errors.length === 0) {
              return result
            } else {
              return {
                path: '/dev/null',
                external: true,
                warnings: [
                  {
                    text: 'failed to resolve Node API module; replacing with /dev/null',
                  },
                ],
              }
            }
          }
        )
        build.onEnd(async ({ metafile }) => {
          if (metafile) {
            const { outputs } = metafile
            // Copy bundled .node modules from outdir to the Lambda directory.
            await Promise.all(
              Object.entries(outputs).flatMap(([entryPoint, { imports }]) =>
                imports
                  .filter(({ path }) => extname(path) === '.node')
                  .map(({ path }) =>
                    copyFile(path, join(dirname(entryPoint), basename(path)))
                  )
              )
            )
            // Delete .node modules in outdir.
            await Promise.all(
              Object.keys(outputs)
                .filter((path) => extname(path) === '.node')
                .map(unlink)
            )
          }
        })
      },
    },
    {
      name: 'write metafile to output directory',
      setup(build) {
        build.onEnd(async ({ metafile }) => {
          if (metafile) {
            await writeFile(
              join(build.initialOptions.outdir, 'metafile.lambda.json'),
              JSON.stringify(metafile)
            )
          }
        })
      },
    },
  ],
}

if (dev) {
  const ctx = await esbuild.context(options)
  await ctx.watch()
} else {
  await esbuild.build(options)
}
