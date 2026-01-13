import { usePlayer } from '@/features/player'
import { SongPreview } from '@/features/SongPreview/SongPreview'
import { useEventListener, useOnUnmount, usePlayerState } from '@/hooks'
import useDelayedFlag from '@/hooks/useDelayedFlag'
import { Pause, Play } from '@/icons'
import type { SongSource } from '@/types'
import clsx from 'clsx'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

const FEATURED_SONGS: { [id: string]: { source: SongSource; id: string } } = {
  gymnopedie: { source: 'builtin', id: 'gymnopedie-no1.mid' },
  ode: { source: 'builtin', id: 'ode-to-joy.mid' },
  canon: { source: 'builtin', id: 'canon-in-d.mid' },
}

export function FeaturedSongsPreview({
  marginTop = 0,
  className,
}: {
  marginTop?: number
  className?: string
}) {
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
        'relative h-[360px] w-full overflow-hidden rounded-lg shadow-xl',
        'bg-gray-[#2e2e2e]',
        className,
      )}
      style={{ marginTop }}
    >
      <SongPreview songId={songId} source={source} />
      {showPlaceholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#2e2e2e]">
          {showSpinner && (
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
          )}
        </div>
      )}
      <div className="absolute top-0 right-0 left-0 z-20 flex h-14 items-center justify-between border-b border-gray-700 bg-gray-800 px-4">
        <div className="flex items-center gap-3">
          <button
            className={clsx(
              'bg-purple-primary hover:bg-purple-hover flex h-8 w-8 items-center justify-center rounded-full text-white transition',
              !playerState.canPlay && 'cursor-progress',
            )}
            onClick={() => player.toggle()}
          >
            {playerState.playing ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <span className="text-sm text-gray-400">Preview</span>
        </div>
        <div className="relative text-white">
          <select
            className="appearance-none rounded bg-gray-700 py-1.5 pr-8 pl-3 text-sm font-medium text-gray-200 transition hover:bg-gray-600"
            onChange={(e) => {
              setCurrentSong(e.target.value as any)
            }}
          >
            <option value="ode">Ode to Joy</option>
            <option value="canon">Canon in D</option>
            <option value="gymnopedie">Gymnopédie No.1</option>
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-300">
            <ChevronDown className="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  )
}
