'use client'

import { isBrowser } from '@/utils'
import { useCallback, useEffect, useState } from 'react'
import Storage from './storage'

export function usePersistedState<T>(
  key: string,
  init: T,
  onChange?: (state: T) => void,
): [T, (state: T) => void] {
  const [state, setState] = useState<T>(init)
  const setPersistedState = useCallback(
    (s: T) => {
      setState(s)
      Storage.set(key, s)
      onChange?.(s)
    },
    [key, onChange],
  )

  // Since the initial HTML will be set from an SSR and React will only attempt to Hydrate,
  // we need to ensure any state dependent on storage renders once loaded.
  useEffect(() => {
    const s = Storage.get<T | null>(key) ?? init
    setState(s)
    onChange?.(s)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- This useEffect needs to be run only once (or if ever 'key' changes)
  }, [key])

  if (!isBrowser()) {
    return [init, () => {}]
  }

  return [state, setPersistedState]
}
