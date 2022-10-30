/**
 * Generate all of the parsed music files + manifest as used by the app.
 * @fileoverview
 */

const jsdom = require('jsdom')
const window = new jsdom.JSDOM().window
globalThis.DOMParser = window.DOMParser
globalThis.NodeFilter = window.NodeFilter
import { parseMidi, parseMusicXml } from '../src/features/parsers'
import type { MusicFile, Song } from '../src/types'
import { musicFiles } from './songdata'
import crypto, { BinaryLike } from 'crypto'
import fs from 'fs'
import { join as pathJoin } from 'path'

function hash(bytes: BinaryLike): string {
  return crypto.createHash('md5').update(bytes).digest('hex')
}

const baseDir = pathJoin(__dirname, '..', 'public')

type ParsedMusicFile = MusicFile & { parsedSong: Song }
const parsedMusic: ParsedMusicFile[] = musicFiles
  .map((musicFile) => {
    const path = pathJoin(baseDir, musicFile.file)
    if (path.toLowerCase().endsWith('mid')) {
      try {
        const u8Array: Uint8Array = new Uint8Array(fs.readFileSync(path))
        return { ...musicFile, parsedSong: parseMidi(u8Array.buffer), id: hash(u8Array) }
      } catch (err) {
        console.error(`Error parsing file: ${path}` + err)
      }
    }
    if (path.endsWith('xml')) {
      try {
        const txt = fs.readFileSync(path, { encoding: 'utf-8' })
        return { ...musicFile, parsedSong: parseMusicXml(txt) }
      } catch (err) {
        console.error(`Error parsing file: ${path}` + err)
      }
    }
  })
  .filter((x) => !!x) as ParsedMusicFile[]

const manifestJson = parsedMusic.map((parsed: MusicFile) => {
  let v: any = { ...parsed }
  v.duration = v.parsedSong.duration
  delete v.parsedSong
  return v
})
const manifestSrcPath = pathJoin(__dirname, '..', 'src', 'manifest.json')
fs.writeFileSync(manifestSrcPath, JSON.stringify(manifestJson))
