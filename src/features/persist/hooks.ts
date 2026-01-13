import { isBrowser } from '@/utils'
import { useCallback, useEffect, useState } from 'react'
import Storage from './storage'

export function usePersistedState<T>(key: string, init: T): [T, (state: T) => void] {
  const [state, setState] = useState<T>(() => {
    if (!isBrowser()) {
      return init
    }
    return Storage.get<T | null>(key) ?? init
  })
  const setPersistedState = useCallback(
    (s: T) => {
      setState(s)
      Storage.set(key, s)
    },
    [key],
  )

  if (!isBrowser()) {
    return [init, () => {}]
  }

  return [state, setPersistedState]
}
