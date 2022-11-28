import { usePersistedState } from '@/features/persist'
import { getDefaultSongSettings } from '@/features/SongVisualization/utils'
import { SongConfig } from '@/types'

export default function useSongSettings(file: string) {
  return usePersistedState<SongConfig>(`${file}/settings`, getDefaultSongSettings())
}
