import { Plugin } from 'vite'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

export function metadataApiPlugin(): Plugin {
  return {
    name: 'metadata-api',
    configureServer(server) {
      server.middlewares.use('/api/metadata', async (req, res, next) => {
        if (req.method !== 'POST') {
          return next()
        }

        let body = ''
        req.on('data', chunk => {
          body += chunk.toString()
        })

        req.on('end', () => {
          try {
            const { songId, time, midiNote, hand, finger } = JSON.parse(body)

            // Construct the metadata file path
            const metadataPath = join(
              process.cwd(),
              'public/music/songs',
              `${songId.replace('.mid', '')}.metadata.json`
            )

            // Read the existing metadata or create new one
            let metadata
            if (existsSync(metadataPath)) {
              metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'))
            } else {
              // Create new metadata structure
              metadata = { notes: [] }
            }

            // Find and update the note
            let note = metadata.notes.find(
              (n: any) => n.midiNote === midiNote && Math.abs(n.time - time) < 0.05
            )

            if (note) {
              // Update existing note
              note.hand = hand
              note.finger = finger
            } else {
              // Create new note entry
              note = { midiNote, time, hand, finger }
              metadata.notes.push(note)
            }

            // Write back to file
            writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))

            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: true }))
          } catch (error: any) {
            console.error('Error updating metadata:', error)
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: error.message }))
          }
        })
      })
    },
  }
}
