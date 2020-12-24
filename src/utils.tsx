import React, { ReactChild } from 'react'
import { parseMusicXML, parseMidi, getHandIndexesForTeachMid, parserInferHands } from './parsers'
import { PlayableSong, Song } from './types'
import { getKey } from './synth/utils'
import { InstrumentName } from './synth/instruments'

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

export { Sizer, getSong, formatTime, CenteringWrapper, inferHands, Deferred, isBlack }
