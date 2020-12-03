/**
 * Generate all of the parsed music files + manifest as used by the app.
 * Note: CRA fucks with tsconfig.json. Need to switch to commonjs when running this command.
 * @fileoverview
 */

const jsdom = require('jsdom')
const window = new jsdom.JSDOM().window
globalThis.DOMParser = window.DOMParser
globalThis.NodeFilter = window.NodeFilter
import { parseMidi, parseMusicXML, Song } from '../src/parsers'
import { musicFiles, MusicFile } from './songdata'
const fs: any = require('fs')
const pathJoin: any = require('path').join

const baseDir = pathJoin(__dirname, '..', 'public')

const defGood: Array<string> = []
musicFiles
  .filter((song) => song.type === 'song')
  .forEach((musicFile) => {
    const path = musicFile.file
    let parsed: Song | null = null
    if (path.toLowerCase().endsWith('mid')) {
      try {
        var buf = new Uint8Array(fs.readFileSync(pathJoin(baseDir, path))).buffer
        parsed = parseMidi(buf)
      } catch (err) {
        console.error(`Error parsing file: ${path}` + err)
        return
      }
    } else if (path.endsWith('xml')) {
      try {
        const txt = fs.readFileSync(pathJoin(baseDir, path), { encoding: 'utf-8' })
        parsed = parseMusicXML(txt)
      } catch (err) {
        console.error(`Error parsing file: ${path}` + err)
        return
      }
    }
    if (!parsed) {
      return
    }

    const filename = musicFile.file
    const len = Object.keys(parsed.tracks).length
    if (hasExactlyTwoPianoTracks(parsed, filename)) {
      defGood.push(filename)
    } else if (len == 2 || len == 3) {
      // console.log(`File may be good due to ${len} tracks: ${filename}`)
    } else if (musicFile.file.includes('piano')) {
      // console.log(`File include piano in title, may be good: ${filename}`)
    }
  })
console.log(
  'These files have exactly two piano tracks, are almost definitely excellent:\n',
  defGood.join('\n'),
)

function hasExactlyTwoPianoTracks(parsed: Song, f: string) {
  return (
    Object.values(parsed.tracks).filter(
      (track) =>
        track.instrument.toLowerCase().includes('piano') ||
        track.name?.toLowerCase().includes('piano'),
    ).length === 2
  )
}
