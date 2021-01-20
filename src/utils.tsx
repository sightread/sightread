import React from 'react'
import { parseMusicXML, parseMidi, getHandIndexesForTeachMid, parserInferHands } from './parsers'
import { PlayableSong, Song } from './types'
import { getKey } from './synth/utils'
import { InstrumentName } from './synth/instruments'
import { getUploadedSong } from './persist'

export function peek(o: any) {
  console.log(o)
  return o
}

function Sizer({ height, width }: { height?: number; width?: number }) {
  return <div style={{ width, height }} />
}

export const isBrowser = () => typeof window === 'object'

/*
 * In development, parse on client.
 * In production, use preparsed songs.
 */
async function getSong(url: string): Promise<Song> {
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

function inferHands(song: Song, isTeachMidi: boolean): PlayableSong {
  let playableSong = song as PlayableSong
  playableSong.config = isTeachMidi ? getHandIndexesForTeachMid(song) : parserInferHands(song)
  return playableSong
}

function formatTime(seconds: number) {
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

function CenteringWrapper({ children, backgroundColor = 'white', gutterWidth = 50 }: any) {
  return (
    <>
      <div style={{ position: 'relative', width: '100%' }}>
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor,
            zIndex: -1,
          }}
        />
        <div
          style={{
            width: `calc(100vw - ${gutterWidth * 2}px)`,
            alignItems: 'center',
            maxWidth: 1024,
            margin: '0 auto',
          }}
        >
          {children}
        </div>
      </div>
    </>
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

export function formatInstrumentName(instrument: InstrumentName): string {
  return instrument
    .split('_')
    .map((i) => i.charAt(0).toUpperCase() + i.slice(1))
    .join(' ')
}

function convertHexColorToIntArr(hexString: string): number[] {
  if (hexString.length !== 7 || hexString[0] !== '#') {
    console.error('invlaid hex value.')
    return []
  }
  const num1 = parseInt(hexString.slice(1, 3), 16)
  const num2 = parseInt(hexString.slice(3, 5), 16)
  const num3 = parseInt(hexString.slice(5), 16)
  return [num1, num2, num3]
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
  return '#' + rgb.map((n) => n.toString(16)).join('')
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

export { Sizer, getSong, formatTime, CenteringWrapper, inferHands, Deferred, isBlack }
