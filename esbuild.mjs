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
  plugins: [
    {
      name: 'exclude node_modules from bundling',
      setup(build) {
        build.onResolve({ filter: /^(?:[^./~]|~[^/])/ }, () => ({
          external: true,
        }))
      },
    },
  ],
  platform: 'node',
  watch,
})
