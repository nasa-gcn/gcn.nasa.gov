import { build } from 'esbuild'

const args = process.argv.slice(2)
const watch = args.includes('--watch')

await build({
  bundle: true,
  entryPoints: ['./app/email-incoming/index.ts'],
  logLevel: 'info',
  outfile: 'email-incoming/index.js',
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
