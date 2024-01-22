import { useSong } from '@/features/data'
import { getPlayer } from '@/features/player'
import { getHandSettings, SongVisualizer } from '@/features/SongVisualization'
import { SongSource } from '@/types'
import { useEffect } from 'react'
import { getDefaultSongSettings } from '../SongVisualization/utils'

interface SongPreviewProps {
  songBytes?: ArrayBuffer
  songId: string
  source: SongSource
}

function SongPreview({ songId, source }: SongPreviewProps) {
  const { data: song, error } = useSong(songId, source)

  useEffect(() => {
    if (!song) {
      return
    }
    const player = getPlayer()
    player.setSong(song, getDefaultSongSettings(song))
  }, [song])

  const songConfig = getDefaultSongSettings(song)
  return (
    <SongVisualizer
      song={song}
      config={songConfig}
      getTime={() => getPlayer().getTime()}
      hand="both"
      handSettings={getHandSettings(songConfig)}
    />
  )
}

export type { SongPreviewProps }
export { SongPreview }
