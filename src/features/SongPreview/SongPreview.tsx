import { getSong } from '@/features/api'
import Player from '@/features/player'
import { getHandSettings, SongVisualizer } from '@/features/SongVisualization'
import { Song } from '@/types'
import { useState, useEffect, useRef, useMemo } from 'react'
import { parseMidi } from '../parsers'
import { getDefaultSongSettings } from '../SongVisualization/utils'

interface SongPreviewProps {
  songBytes?: ArrayBuffer
  songId: string
  source: string
  onReady?: (songId: string) => void
}

function SongPreview({ songId, source, onReady, songBytes }: SongPreviewProps) {
  const [song, setSong] = useState<Song>()
  const player = Player.player()
  const onReadyRef = useRef<any>()
  onReadyRef.current = onReady
  const cachedSong = useMemo(() => {
    if (!songBytes) return undefined
    const parsed = parseMidi(songBytes)
    // TODO: move to logical place.
    parsed.notes = parsed.items.filter((i) => i.type === 'note') as any
    parsed.measures = parsed.items.filter((i) => i.type === 'measure') as any
    return parsed
  }, [songBytes])

  useEffect(() => {
    if (cachedSong) {
      player.setSong(cachedSong, getDefaultSongSettings(song))
      onReadyRef.current?.(songId)
      return
    }

    getSong(source, songId).then((song) => {
      setSong(song)
      player.setSong(song, getDefaultSongSettings(song))
      onReadyRef.current?.(songId)
    })
  }, [songId, source, setSong, player, song, songBytes])

  const songConfig = getDefaultSongSettings(cachedSong ?? song)
  return (
    <SongVisualizer
      song={cachedSong ?? song}
      config={songConfig}
      getTime={() => Player.player().getTime()}
      hand={'both'}
      handSettings={getHandSettings(songConfig)}
    />
  )
}

export type { SongPreviewProps }
export { SongPreview }
