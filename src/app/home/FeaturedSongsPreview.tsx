'use client'

import { usePlayer } from '@/features/player'
import { SongPreview } from '@/features/SongPreview/SongPreview'
import { useEventListener, useOnUnmount, usePlayerState } from '@/hooks'
import useDelayedFlag from '@/hooks/useDelayedFlag'
import { Pause, Play } from '@/icons'
import type { SongSource } from '@/types'
import clsx from 'clsx'
import { useState } from 'react'

const FEATURED_SONGS: { [id: string]: { source: SongSource; id: string } } = {
  gymnopedie: { source: 'builtin', id: 'gymnopedie-no1.mid' },
  ode: { source: 'builtin', id: 'ode-to-joy.mid' },
  canon: { source: 'builtin', id: 'canon-in-d.mid' },
}

export function FeaturedSongsPreview({ marginTop }: { marginTop: number }) {
  const playerState = usePlayerState()
  const [currentSong, setCurrentSong] = useState<keyof typeof FEATURED_SONGS>('ode')
  const { id: songId, source } = FEATURED_SONGS[currentSong]
  const showPlaceholder = !playerState.canPlay
  const showSpinner = useDelayedFlag(showPlaceholder, 300)
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
        'relative h-[400px] w-3/4 max-w-[760px] self-center',
        'bg-gray-[#2e2e2e] overflow-hidden rounded-lg',
        'shadow-xl',
      )}
      style={{ minWidth: 'min(100vw - 40px, 400px)', marginTop }}
    >
      <SongPreview songId={songId} source={source} />
      {showPlaceholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#2e2e2e]">
          {showSpinner && (
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
          )}
        </div>
      )}
      <div className="absolute top-0 flex h-[50px] w-full items-center justify-center bg-black/80">
        <button
          className={clsx(
            'items-center gap-1 text-white hover:text-gray-300',
            'absolute left-5 flex sm:static',
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
        <div className="absolute top-1/2 right-5 -translate-y-1/2 text-white">
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
            <option value="gymnopedie">Gymnopédie No.1</option>
          </select>
        </div>
      </div>
    </div>
  )
}
