import fs from 'fs'
import { isPiano, parseMidi, parseMusicXml } from '../src/features/parsers'
import { Song, Track } from '../src/types'

export function getPianoTracks(parsed: Song): Track[] {
  return Object.entries(parsed.tracks)
    .filter(([id, track]) => isPiano(track) && trackNotEmpty(parsed, +id))
    .map(([_id, track]) => track)
}

function trackNotEmpty(song: Song, trackId: number) {
  return song.notes.find((n) => n.track === trackId)
}

export function parseFile(path: string): Song {
  if (path.toLowerCase().endsWith('mid')) {
    var buf = new Uint8Array(fs.readFileSync(path)).buffer
    return parseMidi(buf)
  }

  // xml
  const txt = fs.readFileSync(path, { encoding: 'utf-8' })
  return parseMusicXml(txt)
}

export function last<T>(arr: Array<T>): T {
  return arr[arr.length - 1]
}
