/**
 * STEPS:
 * You do NOT need to have the app running.
 * 1. Download a fresh copy of the archive
 * 2. Unzip it
 * 3. Move it into the `app` folder. it should be named archive.json
 * 4. Run `npm run build`
 * 5. Run `node build/migrations/updates/index.mjs`
 * 6. Your file with circulars that need to be updated will be at the top level directory.
 * 7. MAKE SURE TO REMOVE THE ARCHIVE FOLDER FROM THE APP WHEN YOU ARE DONE!
 *    If you forget, it will break local dev in a very difficult to debug way. The container will start,
 *    but will crash and be removed. It does this because the watcher tries to watch all the files in
 *    the archive directory and it gets overwhelmed and OOMs.
 *
 * If you are using visual studio code, you can open the `event_id_updates.json` and make it more readable
 * by pushing command + shift + P and typing `Format Document`.
 */
import * as fs from 'fs'
import { appendFile } from 'node:fs/promises'
import * as path from 'path'

import { parseEventFromSubject } from '~/routes/circulars/circulars.lib'

async function processFiles() {
  const folderPath = './app/archive.json'
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err)
      return
    }
    files.forEach(async (file) => {
      const filePath = path.join(folderPath, file)
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      const circular = JSON.parse(fileContent)
      const eventId = parseEventFromSubject(circular.subject)
      const previousEventId = circular.eventId ? circular.eventId : undefined
      if (eventId && eventId != previousEventId) {
        // if it already has a GRB eventId, don't worry about updating it
        if (!previousEventId || previousEventId.split(' ')[0] != 'GRB') {
          await appendFile(
            './event_id_updates.csv',
            `${circular.circularId},${eventId},${previousEventId}\n`
          )
        }
      }
    })
  })
}

processFiles()
