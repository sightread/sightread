/**
 * Generate all of the parsed music files + manifest as used by the app.
 * Note: CRA messes with tsconfig.json. Need to switch to commonjs when running this command.
 * @fileoverview
 */

import fs from 'fs'
const jsdom = require('jsdom')
const window = new jsdom.JSDOM().window
const pathJoin = require('path').join
globalThis.DOMParser = window.DOMParser
globalThis.NodeFilter = window.NodeFilter
import { Song } from '../src/types'
import { parseFile, getPianoTracks, last } from './utils'

const MIDIS_DIR = '/Users/jake/Music/midis/BitMidi'
const GOOD_DIR = pathJoin(MIDIS_DIR, 'good')
const MIDI_FILES = fs.readdirSync(MIDIS_DIR)

const lastGoodFile = last(fs.readdirSync(GOOD_DIR))
const indexOfLastGoodFile = MIDI_FILES.indexOf(lastGoodFile)

// fs.mkdirSync(GOOD_DIR)
const defGood: Array<string> = []
let i = indexOfLastGoodFile == -1 ? 0 : indexOfLastGoodFile
console.log(`Starting at: ${i}/${MIDI_FILES.length}.`)

console.log(getPianoTracks(parseFile(pathJoin(GOOD_DIR, 'SERENADE.mid'))))
const midiPaths = MIDI_FILES.slice(i)
midiPaths.forEach((filename: string) => {
  if (i % 100 == 0) {
    console.log(`Progress: ${i}/${MIDI_FILES.length}.`)
  }
  i++

  const path = pathJoin(MIDIS_DIR, filename)
  let parsed: Song | null = null
  try {
    parsed = parseFile(path)
  } catch (err) {
    console.log(`Error parsing file: ${path}, error: ${err}`)
    return
  }

  if (getPianoTracks(parsed).length == 2) {
    defGood.push(path)
    fs.copyFileSync(path, pathJoin(GOOD_DIR, filename))
  }
})
console.log(`Progress: ${i}/${MIDI_FILES.length}.\n`)

console.log(
  'These files have exactly two piano tracks, are almost definitely excellent:\n',
  defGood.join('\n'),
)
