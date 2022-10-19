import { getSong } from '@/features/api'
import Player from '@/features/player'
import { getHandSettings, SongVisualizer } from '@/features/SongVisualization'
import { useSongSettings } from '@/hooks'
import { Song } from '@/types'
import { useState, useEffect } from 'react'

interface SongPreviewProps {
  songId: string
  source: string
  onReady?: (songId: string) => void
}

function SongPreview({ songId, source, onReady }: SongPreviewProps) {
  const [song, setSong] = useState<Song>()
  const [songConfig, setSongConfig] = useSongSettings('unknown')
  const player = Player.player()

  useEffect(() => {
    getSong(source, songId).then((song) => {
      setSong(song)
      player.setSong(song, songConfig)
      onReady?.(songId)
    })
  }, [songId, source])

  return (
    <SongVisualizer
      song={song}
      config={songConfig}
      getTime={() => Player.player().getTime()}
      hand={'both'}
      handSettings={getHandSettings(songConfig)}
    />
  )
}

export type { SongPreviewProps }
export { SongPreview }
