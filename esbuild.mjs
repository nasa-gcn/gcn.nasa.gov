import { build } from 'esbuild'

const args = process.argv.slice(2)
const watch = args.includes('--watch')

await build({
  bundle: true,
  entryPoints: ['./app/events/email-incoming/index.ts'],
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
