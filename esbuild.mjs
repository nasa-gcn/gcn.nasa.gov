import esbuild from 'esbuild'
import { glob } from 'glob'

const args = process.argv.slice(2)
const dev = args.includes('--dev')
const entryPoints = await glob(
  './app/{email-incoming,table-streams}/*/index.ts'
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
  external: ['@aws-sdk/*', 'aws-sdk'],
  platform: 'node',
  target: ['node18'],
  minify: !dev,
  sourcemap: dev,
}

if (dev) {
  const ctx = await esbuild.context(options)
  await ctx.watch()
} else {
  await esbuild.build(options)
}
