import { useSong } from '@/features/data'
import { usePlayer } from '@/features/player'
import { getHandSettings, SongVisualizer } from '@/features/SongVisualization'
import { SongSource } from '@/types'
import { useEffect, useMemo } from 'react'
import { getDefaultSongSettings } from '../SongVisualization/utils'

interface SongPreviewProps {
  songBytes?: ArrayBuffer
  songId: string
  source: SongSource
}

function SongPreview({ songId, source }: SongPreviewProps) {
  const { data: song, error } = useSong(songId, source)
  const player = usePlayer()
  const songConfig = useMemo(() => {
    const defaults = getDefaultSongSettings(song)
    return {
      ...defaults,
      countdownSeconds: 0,
      metronome: { ...defaults.metronome, enabled: false, volume: 0 },
    }
  }, [song])

  useEffect(() => {
    if (!song) {
      return
    }
    player.setSong(song, songConfig)
  }, [song, player, songConfig])

  return (
    <SongVisualizer
      song={song}
      config={songConfig}
      getTime={() => player.getTime()}
      hand="both"
      handSettings={getHandSettings(songConfig)}
    />
  )
}

export type { SongPreviewProps }
export { SongPreview }
