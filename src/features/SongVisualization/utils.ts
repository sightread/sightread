import { Song, Track, SongNote, SongConfig, SongMeasure, Hand, TrackSetting } from '@/types'
import { gmInstruments, InstrumentName } from '@/features/synth'
import { clamp, mapValues } from '@/utils'
import { getPersistedSongSettings, setPersistedSongSettings } from '@/features/persist'
import { isBlack } from '../theory'
import { parserInferHands } from '../parsers'
import { GivenState } from './canvasRenderer'

export function getSongRange(song: { notes: SongNote[] } | undefined) {
  const notes = song?.notes ?? []
  let startNote = notes[0]?.midiNote ?? 21
  let endNote = notes[0]?.midiNote ?? 108

  for (let { midiNote } of notes) {
    startNote = Math.min(startNote, midiNote)
    endNote = Math.max(endNote, midiNote)
  }

  // Ensure we show at least a min of 36 notes just so it doesn't look ridiculous
  const diff = endNote - startNote
  if (diff < 36) {
    const fix = Math.floor((36 - diff) / 2)
    startNote -= fix
    endNote += fix
  }

  startNote = clamp(startNote - 2, { min: 21, max: 107 })
  endNote = clamp(endNote + 2, { min: startNote + 1, max: 108 })

  // If the prev/next note is black, we need to include it as well.
  // Since black notes are partially on the adjacent notes as well.
  if (isBlack(startNote - 1) && startNote > 21) {
    startNote--
  }
  if (isBlack(endNote + 1) && endNote < 108) {
    endNote++
  }

  return { startNote, endNote }
}

export function getHandSettings(config: SongConfig | undefined) {
  if (!config) {
    return {}
  }
  return mapValues(config.tracks, (trackSetting) => {
    return { hand: trackSetting.hand }
  })
}

function getInstrument(track: Track): InstrumentName {
  return track.program && track.program >= 0
    ? gmInstruments[track.program]
    : ((track.instrument || track.name) as InstrumentName) ?? gmInstruments[0]
}

export function getDefaultSongSettings(song?: Song): SongConfig {
  const songConfig: SongConfig = {
    left: true,
    right: true,
    waiting: false,
    noteLetter: false,
    skipMissedNotes: false,
    visualization: 'falling-notes',
    tracks: {},
  }
  if (!song) {
    return songConfig
  }

  const { left, right } = inferHands(song)
  const tracks: { [id: number]: TrackSetting } = mapValues(song.tracks, (track, trackId) => {
    const id = parseInt(trackId)
    const hand = left === id ? 'left' : right === id ? 'right' : 'none'
    return {
      track,
      hand: hand as any,
      count: song.notes.filter((n) => n.track === id).length,
      instrument: getInstrument(track),
      sound: true,
    }
  })
  songConfig.tracks = tracks
  return songConfig
}

export function getSongSettings(file: string, song: Song): SongConfig {
  let persisted = getPersistedSongSettings(file)
  if (persisted) {
    return persisted
  }
  const songSettings = getDefaultSongSettings(song)
  setPersistedSongSettings(file, songSettings)
  return songSettings
}

function inferHands(song: Song): { left?: number; right?: number } {
  return parserInferHands(song)
}

// TODO: is this an OK spot?
export type CanvasItem = SongMeasure | SongNote

export function getItemsInView<T>(
  state: GivenState,
  startPred: (elem: CanvasItem) => boolean,
  endPred: (elem: CanvasItem) => boolean,
): CanvasItem[] {
  // First get the whole slice of contiguous notes that might be in view.
  return getRange(state.items, startPred, endPred).filter((item) => {
    // Filter out the notes that may have already clipped off screen.
    // As well as non matching items
    return startPred(item) && isMatchingHand(item, state)
  })
}

/**
 * Get the contiguous range starting from the first element that returns true from the startPred
 * until the first element that fails the endPred.
 */
function getRange<T>(
  array: T[],
  startPred: (elem: T) => boolean,
  endPred: (elem: T) => boolean,
): T[] {
  let start = array.findIndex(startPred)
  if (start === -1) {
    return []
  }

  let end = start + 1
  for (; end < array.length && !endPred(array[end]); end++) {}

  return array.slice(start, end)
}

function isMatchingHand(item: CanvasItem, state: GivenState) {
  const { hand, hands } = state
  switch (item.type) {
    case 'measure':
      return state.visualization === 'falling-notes'
    case 'note':
      const showLeft = hand === 'both' || hand === 'left'
      if (showLeft && hands[item.track]?.hand === 'left') {
        return true
      }
      const showRight = hand === 'both' || hand === 'right'
      if (showRight && hands[item.track]?.hand === 'right') {
        return true
      }
      return false
  }
}

export type Viewport = { start: number; end: number }

let fontSizeCache: { [px: number]: { [text: string]: { width: number; height: number } } } = {}
export function getFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontPx: number,
): { width: number; height: number } {
  if (fontSizeCache[fontPx]?.[text]) {
    return fontSizeCache[fontPx][text]
  }

  // Height is fontHeight as opposed to the height of the actual letter.
  const metrics = ctx.measureText(text)
  if (!fontSizeCache[fontPx]) {
    fontSizeCache[fontPx] = {}
  }
  const size = {
    width: metrics.width,
    height: metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent,
  }

  // If height detection is unsupported, fallback to width of M character which is
  // an approxmiation according to StackOverflow: https://stackoverflow.com/a/13318387
  if (!size.height) {
    size.height = ctx.measureText('M').width
  }
  fontSizeCache[fontPx][text] = size
  return size
}

export const PIXELS_PER_SECOND = 225
