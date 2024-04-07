'use client'

import clsx from 'clsx'
import { useState } from 'react'
import { Pause, Play } from '@/icons'
import { useEventListener, useOnUnmount, usePlayerState } from '@/hooks'
import type { SongSource } from '@/types'
import { SongPreview } from '@/features/SongPreview/SongPreview'
import { usePlayer } from '@/features/player'
import placeholderPic from './featured-songs-placeholder.png'
import Image from 'next/image'

// TODO: placeholder for featured img to improve loading state.
const FEATURED_SONGS: { [id: string]: { source: SongSource; id: string } } = {
  prelude: { source: 'builtin', id: 'fa7a5d0bf5012a4cb4a19f1de2e58b10' },
  ode: { source: 'builtin', id: '8d4441d47b332772da481c529bd38e24' },
  canon: { source: 'builtin', id: '7641a769d0e9ec9c95b2b967f2ad2cf3' },
}

export function FeaturedSongsPreview() {
  const playerState = usePlayerState()
  const [currentSong, setCurrentSong] = useState<keyof typeof FEATURED_SONGS>('ode')
  const { id: songId, source } = FEATURED_SONGS[currentSong]
  const showPlaceholder = !playerState.canPlay
  const player = usePlayer()

  useEventListener('keydown', (event: Event) => {
    const e = event as KeyboardEvent
    if (e.key === ' ') {
      e.preventDefault()
      player.toggle()
      return
    }
  })

  useOnUnmount(() => player.pause())

  return (
    <div
      className={clsx(
        'relative w-3/4 max-w-[760px] h-[400px] self-center  mt-[-75px]',
        'overflow-hidden rounded-lg bg-gray-[#2e2e2e]',
        'shadow-xl',
      )}
      style={{ minWidth: 'min(100vw - 40px, 400px)' }}
    >
      <SongPreview songId={songId} source={source} />
      {showPlaceholder && (
        <Image alt="falling notes of ode to joy" src={placeholderPic} fill priority />
      )}
      <div className="absolute top-0 w-full h-[50px] bg-black/80 flex items-center justify-center">
        <button
          className={clsx(
            'gap-1 items-center hover:text-gray-300 text-white',
            'flex absolute left-5 sm:static',
            !playerState.canPlay && 'cursor-progress',
          )}
          onClick={() => player.toggle()}
        >
          {playerState.playing ? (
            <>
              <Pause size={24} />
              Pause
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
  )
}
