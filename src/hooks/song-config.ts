import { usePersistedState } from '@/persist'
import { SongConfig } from '@/types'

export function useSongSettings(file: string) {
  return usePersistedState<SongConfig>(`${file}/settings`, {
    left: true,
    right: true,
    waiting: false,
    noteLetter: false,
    visualization: 'falling-notes',
    tracks: {},
  })
}
