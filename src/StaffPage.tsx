import React, { useEffect, useRef, useState } from 'react'
import { Song, parseMusicXML, parseMidi, getNoteValue, STAFF } from './utils'
import { usePlayer, useWindowSize, useRAFLoop } from './hooks'

import FClefSVG from './FClef.svg'
import GClefSVG from './GClef.svg'

export function StaffPage() {
  const [song, setSong] = useState<Song | null>(null)
  const { player } = usePlayer()

  const songLocation = window.location.pathname.substring(6)
  useEffect(() => {
    getSong(`/${songLocation}`).then((song: Song) => {
      setSong(song)
      player.setSong(song)
    })

    return function cleanup() {}
  }, [songLocation, player])

  if (!song) {
    return <span> Loading...</span>
  }
  return (
    <div style={{ width: '100%', backgroundColor: 'white' }} className="staffPage">
      <WindowedStaffBoard song={song} />
    </div>
  )
}

const PIXELS_PER_SECOND = 300

export function WindowedStaffBoard({ song }: { song: Song }) {
  const windowSize = useWindowSize()
  const divRef = useRef<HTMLDivElement>(null)
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<any>(null)
  const width = song.duration * PIXELS_PER_SECOND
  const { player } = usePlayer()
  // time + bpm is not normalized w.r.t to wall clock. should do this for a reasonable experience.
  const getXPos = (time: number) => time * PIXELS_PER_SECOND + 50

  useRAFLoop((dt: number) => {
    if (!outerRef.current || !innerRef.current) {
      return
    }
    const now = player.getTime()
    let offset = getXPos(now) - 50
    innerRef.current.style.transform = `translateX(${-offset}px)`
  })

  return (
    <div
      style={{
        position: 'fixed',
        overflow: 'hidden',
        height: windowSize.height,
        width: windowSize.width,
      }}
      ref={outerRef}
    >
      <div style={{ height: '100%', width }}>
        <div
          ref={divRef}
          style={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '100vw',
            backgroundColor: 'white',
          }}
        >
          <Stave width={'calc(100% - 100px)'} height={100} staff="trebl" />
          <Sizer height={70} />
          <Stave width={'calc(100% - 100px)'} height={100} staff="bass" />
          <div
            style={{
              position: 'absolute',
              top: -50,
              left: 200,
              width: 7,
              height: 375,
              backgroundColor: '#B91919',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: -50,
              left: 188,
              width: 30,
              height: 375,
              backgroundColor: 'rgba(185,25,25,0.21)',
            }}
          />
        </div>
      </div>
    </div>
  )
}

// TODO:
// - notes
// - measures
// - scalability of Grand Staff.

// Make a staffz
function Stave({ width, height, staff }: any) {
  const clefImgSrc = staff === 'trebl' ? GClefSVG : FClefSVG
  const clefStyle =
    staff === 'trebl' ? { height: 160, top: -20, left: -5 } : { height: 80, top: 2, left: 10 }

  function Line() {
    return (
      <hr
        style={{ width: '100%', height: 2, backgroundColor: 'black', border: 'none', margin: 0 }}
      />
    )
  }
  return (
    <div style={{ position: 'relative', width, height, margin: '0 auto' }}>
      <div style={{ position: 'absolute', left: 0, width: 2, height, backgroundColor: 'black' }} />
      <img style={{ position: 'absolute', ...clefStyle }} src={clefImgSrc} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height,
        }}
      >
        <Line />
        <Line />
        <Line />
        <Line />
        <Line />
      </div>
    </div>
  )
}

function Sizer({ height, width }: { height?: number; width?: number }) {
  return <div style={{ width, height }} />
}

async function getSong(url: string) {
  if (url.includes('.xml')) {
    const xml = await (await fetch(url)).text()
    return parseMusicXML(xml)
  }
  const buffer = await (await fetch(url)).arrayBuffer()
  return parseMidi(buffer)
}
