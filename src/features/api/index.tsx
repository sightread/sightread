import { parseMusicXml, parseMidi } from '@/features/parsers'
import type { Song, SongMeasure, SongNote } from '@/types'
import { getUploadedSong } from '@/features/persist'

/*
 * In development, parse on client.
 * In production, use preparsed songs.
 */
async function getServerSong(url: string): Promise<Song> {
  if (url.includes('.xml')) {
    const xml = await (await fetch('/' + url)).text()
    return parseMusicXml(xml) as Song
  }
  const buffer = await (await fetch('/' + url)).arrayBuffer()
  return parseMidi(buffer) as Song
}

export async function getSong(url: string): Promise<Song> {
  let song = getUploadedSong(url)
  if (!song) {
    song = await getServerSong(url)
  }
  song.notes = song.items.filter((i) => i.type === 'note') as SongNote[]
  song.measures = song.items.filter((i) => i.type === 'measure') as SongMeasure[]

  return song
}
