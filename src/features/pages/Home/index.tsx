import { AppBar, Sizer } from '@/components'
import Link from 'next/link'
import React, { useState } from 'react'
import { Pause, Play } from '@/icons'
import clsx from 'clsx'
import { SongPreview } from '../../SongPreview/SongPreview'
import { useEventListener, useOnUnmount, usePlayerState } from '@/hooks'
import Head from 'next/head'
import { SongSource } from '@/types'

export const FEATURED_SONGS: { [id: string]: { source: SongSource; id: string } } = {
  prelude: { source: 'builtin', id: 'fa7a5d0bf5012a4cb4a19f1de2e58b10' },
  ode: { source: 'builtin', id: '8d4441d47b332772da481c529bd38e24' },
  canon: { source: 'builtin', id: '7641a769d0e9ec9c95b2b967f2ad2cf3' },
}

export default function Home() {
  const [playerState, playerActions] = usePlayerState()
  const [currentSong, setCurrentSong] = useState<keyof typeof FEATURED_SONGS>('ode')
  const { id: songId, source } = FEATURED_SONGS[currentSong]

  useEventListener('keydown', (event: Event) => {
    const e = event as KeyboardEvent
    if (e.key === ' ') {
      e.preventDefault()
      return playerActions.toggle()
    }
  })

  useOnUnmount(playerActions.pause)

  return (
    <>
      <Head>
        <title>Sightread</title>
      </Head>
      <div className="relative flex flex-col w-full min-h-[800px,100vh] text-white">
        <AppBar />
        <div className="p-8 bg-purple-primary flex flex-col items-center text-center">
          <h1 className="font-bold text-reponsive2Xl">Your Piano Journey Begins Here</h1>
          <Sizer height={8} />
          <h3 className="text-reponsiveXl">
            Plug in your keyboard and learn, right in your browser
          </h3>
          <Sizer height={75 + 18} />
        </div>
        <div
          className={clsx(
            'relative w-3/4 max-w-[760px] h-[400px] self-center  mt-[-75px]',
            'overflow-hidden rounded-lg bg-gray-[#2e2e2e]',
            'shadow-xl',
          )}
          style={{ minWidth: 'min(100vw - 40px, 400px)' }}
        >
          <SongPreview songId={songId} source={source} />
          <div className="absolute top-0 w-full h-[50px] bg-black/80 flex items-center justify-center">
            <button
              className={clsx(
                'gap-1 items-center hover:text-gray-300',
                'flex absolute left-5 sm:static',
                playerState.canPlay ? 'text-white' : 'text-gray-300',
              )}
              onClick={playerActions.toggle}
            >
              {playerState.playing ? (
                <>
                  <Pause size={24} /> Pause
                </>
              ) : (
                <>
                  <Play size={24} />
                  Play
                </>
              )}
            </button>
            <div
              className="absolute right-5 top-1/2 -translate-y-1/2 text-white"
              style={{ transform: 'translateY(-50%)' }}
            >
              <select
                style={{
                  padding: 6,
                  backgroundColor: '#2e2e2e',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 700,
                  border: 'none',
                }}
                onChange={(e) => {
                  setCurrentSong(e.target.value as any)
                }}
              >
                <option value="ode">Ode to Joy</option>
                <option value="canon">Canon in D</option>
                <option value="prelude">Prelude I in C Major</option>
              </select>
            </div>
          </div>
        </div>
        <Sizer height={60} />
        <div
          style={{
            backgroundColor: 'rgba(220, 126, 82, 0.1)',
            marginTop: 'auto',
            minHeight: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 24,
            paddingTop: 42,
            gap: 24,
          }}
        >
          <h3 style={{ color: 'black', fontSize: 'clamp(1rem, 1rem + 1vw, 2rem)' }}>
            Start learning
          </h3>
          <div
            style={{
              display: 'grid',
              gap: 16,
              gridTemplateColumns: 'repeat(auto-fit, minmax(min-content, 150px))',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <Link href={'/songs'}>
              <Button className="bg-purple-primary text-white hover:bg-purple-hover">
                Learn a song
              </Button>
            </Link>
            <Link href={'/freeplay'}>
              <Button className="bg-white text-purple-primary border border-purple-primary hover:bg-purple-light">
                Free play
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

function Button({
  children,
  style,
  className,
}: {
  children?: React.ReactChild
  style?: React.CSSProperties
  className?: string
}) {
  return (
    <button
      className={className}
      style={{
        transition: 'background-color 150ms',
        cursor: 'pointer',
        fontSize: 'clamp(0.875rem, 0.875rem + 0.5vw, 1.2rem)',
        padding: '10px 16px',
        borderRadius: 15,
        fontWeight: 700,
        minWidth: 'max-content',
        width: '100%',
        ...style,
      }}
    >
      {children}
    </button>
  )
}
