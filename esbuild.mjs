import { build } from 'esbuild'
import { glob } from 'glob'

const args = process.argv.slice(2)
const watch = args.includes('--watch')
const entryPoints = await glob('./app/{events,table-streams}/*/index.ts')

await build({
  bundle: true,
  entryPoints,
  logLevel: 'info',
  outdir: 'build',
  outbase: 'app',
  external: ['@aws-sdk/*', 'aws-sdk'],
  platform: 'node',
  minify: true,
  target: ['node18'],
  watch,
})
