import { parseMusicXml, parseMidi } from '@/features/parsers'
import type { Song, SongMeasure, SongNote } from '@/types'
import { getUploadedSong } from '@/features/persist'

/*
 * Retrieves
 */
async function getServerSong(source: string, id: string): Promise<Song> {
  const buffer = await (await fetch(`/api/midi?source=${source}&id=${id}`)).arrayBuffer()
  return parseMidi(buffer) as Song
}

export async function getSong(source: string, id: string): Promise<Song> {
  let song = getUploadedSong(id)
  if (!song) {
    song = await getServerSong(source, id)
  }
  song.notes = song.items.filter((i) => i.type === 'note') as SongNote[]
  song.measures = song.items.filter((i) => i.type === 'measure') as SongMeasure[]

  return song
}
