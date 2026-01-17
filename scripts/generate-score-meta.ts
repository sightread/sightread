/**
 * Generates trimmed MuseScore `--score-meta` fixtures for MIDI files in public/music/songs.
 *
 * Usage:
 *   bun scripts/generate-score-meta.ts
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const MSCORE_PATH = '/Applications/MuseScore 4.app/Contents/MacOS/mscore'
const SONGS_DIR = path.join(process.cwd(), 'public/music/songs')
const FIXTURE_DIR = path.join(process.cwd(), 'tests/mscore-meta')

type ScoreMeta = {
  metadata: {
    title?: string
    duration?: number
    measures?: number
    timesig?: string
    tempo?: number
    keysig?: number
    parts?: Array<{ instrumentId?: string; name?: string; program?: number }>
  }
}

type TrimmedMeta = {
  title?: string
  duration?: number
  measures?: number
  timesig?: string
  tempo?: number
  keysig?: number
  parts?: Array<{ instrumentId?: string; name?: string; program?: number }>
}

function trimMeta(scoreMeta: ScoreMeta): TrimmedMeta {
  return {
    title: scoreMeta.metadata.title,
    duration: scoreMeta.metadata.duration,
    measures: scoreMeta.metadata.measures,
    timesig: scoreMeta.metadata.timesig,
    tempo: scoreMeta.metadata.tempo,
    keysig: scoreMeta.metadata.keysig,
    parts: scoreMeta.metadata.parts?.map((part) => ({
      instrumentId: part.instrumentId,
      name: part.name,
      program: part.program,
    })),
  }
}

mkdirSync(FIXTURE_DIR, { recursive: true })

const midiFiles = readdirSync(SONGS_DIR).filter((file) => file.endsWith('.mid'))

for (const file of midiFiles) {
  const midiPath = path.join(SONGS_DIR, file)
  const output = execFileSync(MSCORE_PATH, ['--score-meta', midiPath], {
    encoding: 'utf8',
  })
  const parsed = JSON.parse(output) as ScoreMeta
  const trimmed = trimMeta(parsed)

  const fixtureName = file.replace(/\.mid$/i, '.score-meta.json')
  const fixturePath = path.join(FIXTURE_DIR, fixtureName)
  writeFileSync(fixturePath, JSON.stringify(trimmed, null, 2))
  console.log(`Wrote ${fixturePath}`)
}
