import esbuild from 'esbuild'
import { glob } from 'glob'
import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import { basename } from 'node:path'
import { dirname, join } from 'path'

const args = process.argv.slice(2)
const dev = args.includes('--dev')
const entryPoints = await glob(
  './app/{eventbridge,email-incoming,scheduled,table-streams}/*/index.ts'
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
      name: 'copy @confluentinc/kafka-javascript addon libraries',
      setup(build) {
        build.onEnd(async ({ metafile }) => {
          // Identify output directories for all bundles that include @confluentinc/kafka-javascript
          if (metafile) {
            const pkgDir = 'node_modules/@confluentinc/kafka-javascript'
            const inputPath = join(pkgDir, 'librdkafka.js')
            const outDirs = Object.entries(metafile.outputs).flatMap(
              ([key, { inputs }]) => {
                if (Object.hasOwn(inputs, inputPath)) return dirname(key)
                else return []
              }
            )

            if (outDirs.length > 0) {
              const relPaths = await glob('**/*.node', { cwd: pkgDir })

              // Copy addon libraries to all output directories
              await Promise.all(
                relPaths.flatMap((relPath) => {
                  const relDir = dirname(relPath)
                  const srcPath = join(pkgDir, relPath)

                  return outDirs.map(async (outDir) => {
                    const destDir = join(outDir, relDir)
                    const destPath = join(outDir, relPath)
                    console.log(`Copying ${srcPath} -> ${destPath}`)
                    await mkdir(destDir, { recursive: true })
                    await copyFile(srcPath, destPath)
                  })
                })
              )

              // In dev mode, just copy to build directory
              if (dev) {
                await Promise.all(
                  relPaths.map(async (relPath) => {
                    const srcPath = join(pkgDir, relPath)
                    const destPath = join(
                      build.initialOptions.outdir,
                      basename(relPath)
                    )
                    console.log(`Copying ${srcPath} -> ${destPath}`)
                    await copyFile(srcPath, destPath)
                  })
                )
              }
            }
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
