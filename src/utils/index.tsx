import React, { CSSProperties, PropsWithChildren, Ref } from 'react'
import {
  parseMusicXML,
  parseMidi,
  getHandIndexesForTeachMid,
  parserInferHands,
} from '../features/parsers'
import { Song, SongConfig, SongMeasure, SongNote } from '@/types'
import { getKey } from '@/synth/utils'
import { InstrumentName } from '@/synth/instruments'
import { getUploadedSong } from '@/persist'

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

export function Sizer({ height, width }: { height?: number; width?: number }) {
  return <div style={{ width, height, minWidth: width, minHeight: height }} />
}

export function isBrowser() {
  return typeof window === 'object'
}

/*
 * In development, parse on client.
 * In production, use preparsed songs.
 */
async function getServerSong(url: string): Promise<Song> {
  if (process.env.NODE_ENV === 'development') {
    if (url.includes('.xml')) {
      const xml = await (await fetch('/' + url)).text()
      return parseMusicXML(xml) as Song
    }
    const buffer = await (await fetch('/' + url)).arrayBuffer()
    return parseMidi(buffer) as Song
  }

  const parsedUrl = '/generated/' + url.replace(/\.(mid|xml)/i, '.json')
  return fetch(parsedUrl).then((res) => res.json())
}

export async function getSong(url: string): Promise<Song> {
  let song = getUploadedSong(url)
  if (!song) {
    song = await getServerSong(url)
  }
  song.notes = song.items.filter((i) => i.type === 'note') as SongNote[]
  song.measures = song.items.filter((i) => i.type === 'measure') as SongMeasure[]

  return song
}

export function inferHands(song: Song, isTeachMidi: boolean): { left?: number; right?: number } {
  return isTeachMidi ? getHandIndexesForTeachMid(song) : parserInferHands(song)
}

export function formatTime(seconds: number | string | undefined) {
  if (typeof seconds === 'string' || seconds === undefined) {
    throw new Error('Should not call formatTime on a string')
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

export const breakpoints = {
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

export class Deferred<T> {
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

export function isBlack(note: number) {
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
    localStorage.setItem('test', 'test')
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

/**
 * XORs the keys. Find all the keys that are in one object but not the other.
 */
export function diffKeys<T>(o1: T, o2: T): Array<keyof T> {
  let diff = []
  for (let k in o1) {
    !(k in o2) && diff.push(k)
  }
  for (let k in o2) {
    !(k in o1) && diff.push(k)
  }
  return diff
}

export function getNoteSizes(width: number, whiteCount: number) {
  const whiteWidth = width / whiteCount
  const whiteHeight = Math.min(5 * whiteWidth, 250) // max-height: 250
  const blackWidth = whiteWidth / 2
  const blackHeight = whiteHeight * (2 / 3)

  return { whiteWidth, whiteHeight, blackWidth, blackHeight }
}

export function clamp(number: number, { min = number, max = number }) {
  if (isNaN(number)) {
    return max
  }

  return Math.min(Math.max(number, min), max)
}

export function mapValues<From, To>(
  obj: { [str: string]: From },
  fn: (t: From, key: string) => To,
) {
  return Object.entries(obj).reduce((acc: { [str: string]: To }, [k, v]) => {
    acc[k] = fn(v, k)
    return acc
  }, {})
}

export function getHands(songConfig: SongConfig) {
  let left
  let right
  for (let [id, config] of Object.entries(songConfig.tracks)) {
    if (config.hand === 'left') {
      left = parseInt(id, 10)
    } else if (config.hand === 'right') {
      right = parseInt(id, 10)
    }
  }

  return { left, right }
}
