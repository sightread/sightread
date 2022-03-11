import { SongNote, SongConfig } from '@/types'
import { isBlack } from '@/features/theory'

const trackColors = {
  right: {
    black: '#4912d4',
    white: '#7029fb',
  },
  left: {
    black: '#d74000',
    white: '#ff6825',
  },
  measure: '#C5C5C5', //'#C5C5C5',
}

export function getTrackColor(
  songNote: SongNote,
  songConfig: SongConfig | undefined,
): string | void {
  const hand = songConfig?.tracks?.[songNote.track].hand
  if (hand && hand !== 'none') {
    const type = isBlack(songNote.midiNote) ? 'black' : 'white'
    return trackColors[hand][type]
  }
}
