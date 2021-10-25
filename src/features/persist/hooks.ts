import { useState, useCallback, useEffect } from 'react'
import { isBrowser } from '@/utils'
import Storage from './localStorageWrapper'

export function usePersistedState<T>(key: string, init: T): [T, (state: T) => void] {
  const [state, setState] = useState<T>(init)
  const setPersistedState = useCallback(
    (s: T) => {
      setState(s)
      Storage.set(key, s)
    },
    [key],
  )

  // Since the initial HTML will be set from an SSR and React will only attempt to Hydrate,
  // we need to ensure any state dependent on storage renders once loaded.
  // If UX poorly implemented, this can cause a flicker.
  useEffect(() => setState(Storage.get(key) ?? init), [init, key])

  if (!isBrowser()) {
    return [init, () => {}]
  }

  return [state, setPersistedState]
}
