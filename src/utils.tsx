import React, { CSSProperties, PropsWithChildren, Ref } from 'react'
import { parseMusicXML, parseMidi, getHandIndexesForTeachMid, parserInferHands } from './parsers'
import { PlayableSong, Song, SongMeasure, SongNote } from './types'
import { getKey } from './synth/utils'
import { InstrumentName } from './synth/instruments'
import { getUploadedSong } from './persist'

export function peek(o: any) {
  console.log(o)
  return o
}

export function range(start: number, end: number) {
  let nums = []

  for (let i = start; i <= end; i++) {
    nums.push(i)
  }

  return nums
}

function Sizer({ height, width }: { height?: number; width?: number }) {
  return <div style={{ width, height, minWidth: width, minHeight: height }} />
}

export const isBrowser = () => typeof window === 'object'

/*
 * In development, parse on client.
 * In production, use preparsed songs.
 */
async function getServerSong(url: string): Promise<Song> {
  const localSong = getUploadedSong(url) // if this returns a value then the song was a song uploaded by the user
  if (localSong) {
    return localSong
  }

  if (process.env.NODE_ENV === 'development') {
    if (url.includes('.xml')) {
      const xml = await (await fetch('/' + url)).text()
      return parseMusicXML(xml) as PlayableSong
    }
    const buffer = await (await fetch('/' + url)).arrayBuffer()
    return parseMidi(buffer) as PlayableSong
  }

  const parsedUrl = '/generated/' + url.replace(/\.(mid|xml)/i, '.json')
  return fetch(parsedUrl).then((res) => res.json())
}

async function getSong(url: string): Promise<Song> {
  const song = await getServerSong(url)
  song.notes = song.items.filter((i) => i.type === 'note') as SongNote[]
  song.measures = song.items.filter((i) => i.type === 'measure') as SongMeasure[]
  return song
}

function inferHands(song: Song, isTeachMidi: boolean): PlayableSong {
  let playableSong = song as PlayableSong
  playableSong.config = isTeachMidi ? getHandIndexesForTeachMid(song) : parserInferHands(song)
  return playableSong
}

function formatTime(seconds: number|string|undefined) {
  if (typeof seconds === 'string' || seconds === undefined) {
    throw new Error('Should not call formatTime on a string');
  }

  let min = String(Math.floor(seconds / 60))
  if (min.length === 1) {
    min = '0' + min
  }
  let sec = String(Math.floor(seconds % 60))
  if (sec.length === 1) {
    sec = '0' + sec
  }
  return `${min}:${sec}`
}

type ContainerProps = {
  style?: CSSProperties
  className?: string
  component?: string | React.ElementType
}

const breakpoints = {
  xs: 600,
  sm: 960,
  md: 1280,
  lg: 1920,
  xl: 2400,
}

export function Container({
  children,
  style,
  className = '',
  component: Component = 'div',
}: PropsWithChildren<ContainerProps>) {
  const containerStyle = { boxSizing: 'border-box', position: 'relative', ...style }
  const innerStyle = { margin: 'auto', maxWidth: breakpoints.md, width: '100%' }

  return (
    <Component className={className} style={containerStyle}>
      <div style={innerStyle}>{children}</div>
    </Component>
  )
}

class Deferred<T> {
  promise: Promise<T>
  resolve!: (value: T | PromiseLike<T>) => void
  reject!: (value: T | PromiseLike<T>) => void
  constructor() {
    this.promise = new Promise<T>((res, rej) => {
      this.resolve = res
      this.reject = rej
    })
  }
}

function isBlack(note: number) {
  return getKey(note)?.[1] === 'b'
}

// Allows you to use multiple ref handlers.
export function refs<T>(arr: Ref<T>[]) {
  return (ref: T) => {
    for (let cb of arr) {
      if (typeof cb === 'function') {
        cb(ref)
      } else {
        ;(cb as any).current = ref
      }
    }
  }
}

export function formatInstrumentName(instrument: InstrumentName): string {
  if (!instrument) {
    return ''
  }

  return instrument
    .split('_')
    .map((i) => i.charAt(0).toUpperCase() + i.slice(1))
    .join(' ')
}

function convertHexColorToIntArr(hexString: string): number[] {
  if (hexString.length !== 7 || hexString[0] !== '#') {
    console.error('invalid hex value.')
    return []
  }
  const r = parseInt(hexString.slice(1, 3), 16)
  const g = parseInt(hexString.slice(3, 5), 16)
  const b = parseInt(hexString.slice(5), 16)
  return [r, g, b]
}

// should be rgb value
export function pickHex(hex1: string, hex2: string, weight: number) {
  const w1 = weight
  const w2 = 1 - w1
  const color1 = convertHexColorToIntArr(hex1)
  const color2 = convertHexColorToIntArr(hex2)
  const rgb = [
    Math.round(color1[0] * w1 + color2[0] * w2),
    Math.round(color1[1] * w1 + color2[1] * w2),
    Math.round(color1[2] * w1 + color2[2] * w2),
  ]

  return '#' + rgb.map((n) => n.toString(16).padStart(2, '0')).join('')
}

export function isLocalStorageAvailable(): boolean {
  if (!isBrowser()) {
    return false
  }
  try {
    localStorage.setItem('test', 'test that localstorage is working')
    return true
  } catch (e) {
    return false
  }
}

export function isFileMidi(file: File): boolean {
  return file.type === 'audio/mid' || file.name.endsWith('.mid')
}

export function isFileXML(file: File): boolean {
  return file.name.endsWith('.xml')
}

export function fileToUint8(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    var reader = new FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = (evt: any) => {
      if (evt.target.readyState == FileReader.DONE) {
        const arr = new Uint8Array(evt.target.result)
        resolve(arr)
      }
    }
    reader.onerror = () => {
      console.error('Failed to convert file to Uint8: ', reader.error)
      reader.abort()
      reject()
    }
  })
}

export function fileToString(file: File): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsText(file) // default is utf-8
    reader.onloadend = () => {
      if (reader.result) {
        resolve(reader.result as string)
      }
      reject(null)
    }
    reader.onerror = () => {
      console.error('Failed to convert file to string.', reader.error)
      reader.abort()
      reject(reader.error)
    }
  })
}

function shallowEquals(arr1: any[], arr2: any[]) {
  if (arr1.length !== arr2.length) {
    return false
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] != arr2[i]) {
      return false
    }
  }
  return true
}

/**
 * XORs the keys. Find all the keys that are in one object but not the other.
 */
function diffKeys<T>(o1: T, o2: T): Array<keyof T> {
  let diff = []
  for (let k in o1) {
    !(k in o2) && diff.push(k)
  }
  for (let k in o2) {
    !(k in o1) && diff.push(k)
  }
  return diff
}

function getNoteSizes(width: number, whiteCount: number) {
  const whiteWidth = width / whiteCount
  const whiteHeight = 5 * whiteWidth
  const blackWidth = whiteWidth / 2
  const blackHeight = whiteHeight * (2 / 3)

  return { whiteWidth, whiteHeight, blackWidth, blackHeight }
}

function clamp(number: number, { min, max }: { min?: number; max?: number }) {
  let clamped = number
  if (max) {
    clamped = isNaN(clamped) ? max : Math.min(max, clamped)
  }
  if (min) {
    clamped = Math.max(min, clamped)
  }
  return clamped
}

export {
  clamp,
  Deferred,
  diffKeys,
  formatTime,
  getNoteSizes,
  getSong,
  inferHands,
  isBlack,
  shallowEquals,
  Sizer,
}
