import { PlaySong, PlaySongProps } from '@/features/pages'
import { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const props = {
    props: {},
  }
  if (query === undefined) {
    return props
  }
  const song_location = query.song_location
  if (!Array.isArray(song_location) || song_location.length < 3) {
    return props
  }
  const type = song_location.includes('lessons') ? 'lesson' : 'song'
  return {
    props: { type, songLocation: song_location.join('/') },
  }
}

export default function PlaySongPage(props: PlaySongProps) {
  return <PlaySong {...props} />
}
