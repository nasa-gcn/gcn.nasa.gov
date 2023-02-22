import { build } from 'esbuild'

const args = process.argv.slice(2)
const watch = args.includes('--watch')

await build({
  bundle: true,
  entryPoints: {
    'email-incoming/index': './app/email-incoming/index.ts',
    'legacy-user-migration/index': './app/legacy-user-migration/index.ts',
  },
  logLevel: 'info',
  outdir: '.',
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
