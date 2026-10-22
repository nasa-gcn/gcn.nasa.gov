// This should eventually be a npm package, but for now it lives here.
// It's job is to notify the remix dev server of the version of the running
// app to trigger HMR / HDR.
import { broadcastDevReady, logDevReady } from '@remix-run/node'
import * as fs from 'node:fs'
import * as path from 'node:path'

const buildPath = 'build/server/index.cjs'
const absoluteBuildPath = path.resolve(process.cwd(), buildPath)

let lastTimeout

export default {
  sandbox: {
    async watcher({ filename }) {
      // Only react to changes in the server build output.
      if (path.resolve(filename) !== absoluteBuildPath) return

      if (lastTimeout) {
        clearTimeout(lastTimeout)
      }

      lastTimeout = setTimeout(async () => {
        let contents
        try {
          contents = fs.readFileSync(absoluteBuildPath, 'utf8')
        } catch {
          // Build file may not exist yet or may still be writing; skip this cycle.
          return
        }
        // Only call broadcastDevReady when the build version changes.
        const match = /manifest-([a-f0-9]+)\.js/i.exec(contents)
        if (match) {
          const version = match[1].toLowerCase()
          const build = { assets: { version } }
          try {
            await broadcastDevReady(build)
          } catch {
            logDevReady(build)
          }
        }
      }, 300)
    },
  },
  set: {
    env() {
      // Pass matching env variables through to the application in dev mode.
      const passthruKeys = /^NODE_ENV$|^REMIX_DEV_/
      return {
        testing: Object.fromEntries(
          Object.entries(process.env).filter(([key]) => passthruKeys.test(key))
        ),
      }
    },
  },
}
