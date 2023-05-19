import { build } from 'esbuild'
import { glob } from 'glob'

const args = process.argv.slice(2)
const dev = args.includes('--dev')
const entryPoints = await glob('./app/{events,table-streams}/*/index.ts')

await build({
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
  watch: dev,
})
