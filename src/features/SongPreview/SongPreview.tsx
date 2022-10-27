import { getSong } from '@/features/api'
import Player from '@/features/player'
import { getHandSettings, SongVisualizer } from '@/features/SongVisualization'
import { useSongSettings } from '@/hooks'
import { Song, SongConfig } from '@/types'
import { useState, useEffect } from 'react'

interface SongPreviewProps {
  songId: string
  source: string
  onReady?: (songId: string) => void
}

const EMPTY_SONG_CONFIG: SongConfig = {
  left: true,
  right: true,
  waiting: false,
  noteLetter: false,
  visualization: 'falling-notes',
  tracks: {},
}

function SongPreview({ songId, source, onReady }: SongPreviewProps) {
  const [song, setSong] = useState<Song>()
  const player = Player.player()

  useEffect(() => {
    getSong(source, songId).then((song) => {
      setSong(song)
      player.setSong(song, EMPTY_SONG_CONFIG)
      onReady?.(songId)
    })
  }, [songId, source, onReady, setSong, player])

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
