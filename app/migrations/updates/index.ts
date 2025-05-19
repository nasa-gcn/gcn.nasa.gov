/**
 * STEPS:
 * You do NOT need to have the app running.
 * 1. Download a fresh copy of the archive
 * 2. Unzip it
 * 3. Move it into the `app` folder. it should be named archive.json
 * 4. Run `npm run build`
 * 5. Run `node build/migrations/updates/index.mjs`
 * 6. Your file with circulars that need to be updated will be at the top level directory.
 *
 * If you are using visual studio code, you can open the `event_id_updates.json` and make it more readable
 * by pushing command + shift + P and typing `Format Document`.
 */
import * as fs from 'fs'
import * as path from 'path'

import { parseEventFromSubject } from '~/routes/circulars/circulars.lib'

interface UpdateData {
  circularId: number
  eventId: string
  oldEventId: string
}

function processFiles() {
  const folderPath = './app/archive.json'
  const results = [] as UpdateData[]
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err)
      return
    }
    files.forEach((file) => {
      const filePath = path.join(folderPath, file)
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      const circular = JSON.parse(fileContent)
      const eventId = parseEventFromSubject(circular.subject)
      const previousEventId = circular.eventId ? circular.eventId : undefined
      if (eventId && eventId != previousEventId) {
        results.push({
          circularId: circular.circularId,
          eventId,
          oldEventId: previousEventId,
        })
      }
    })
    const updates = { updates: results }

    fs.writeFile('./event_id_updates.json', JSON.stringify(updates), (err) => {
      if (err) {
        console.log('Error writing file:', err)
      } else {
        console.log('Successfully wrote file')
      }
    })
  })
}

processFiles()
