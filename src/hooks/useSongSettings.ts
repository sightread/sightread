import { usePersistedState } from '@/features/persist'
import { getDefaultSongSettings } from '@/features/SongVisualization/utils'
import { SongConfig } from '@/types'

/**
 * Custom hook for retrieving and persisting song settings.
 * Utilizes `usePersistedState` to manage the state persistence.
 *
 * @param {string} file - The identifier or path of the song file.
 * @return The persisted song settings for the specified file.
 */
export default function useSongSettings(file: string) {
  if (!file) {
    console.error('useSongSettings: file parameter is required');
    return null; 
  }

  try {
    return usePersistedState<SongConfig>(`${file}/settings`, getDefaultSongSettings());
  } catch (error) {
    console.error(`useSongSettings: Failed to get or set persisted state for ${file}`, error);
    return null; 
  }
}

// This modified version includes basic parameter validation and error handling, improving robustness and availability. 

​​
