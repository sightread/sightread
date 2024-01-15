import { batchedFetch } from '@/utils'
import { useCallback, useEffect, useReducer } from 'react'

type FetchStatus = 'idle' | 'pending' | 'success' | 'error'

export interface FetchState<T> {
  status: FetchStatus
  data?: T
  error?: Error
}

interface FetchAction<T> {
  type: 'success' | 'error' | 'pending'
  data?: T
  error?: Error
}

function reducer<T>(state: FetchState<T>, action: FetchAction<T>): FetchState<T> {
  if (action.type === 'pending') {
    return { ...state, status: 'pending' }
  } else if (action.type === 'success') {
    return { status: 'success', data: action.data }
  } else if (action.type === 'error') {
    return { status: 'error', error: action.error }
  }
  return state
}

export function useRemoteResource<T>(getResource: () => Promise<T>): FetchState<T> {
  const [state, dispatch] = useReducer<typeof reducer<T>>(reducer, { status: 'idle' })

  useEffect(() => {
    if (typeof getResource === 'undefined') {
      return
    }
    dispatch({ type: 'pending' })
    getResource()
      .then((data: T) => dispatch({ type: 'success', data }))
      .catch((error: Error) => dispatch({ type: 'error', error }))
  }, [getResource])

  return state
}

/**
 * A hook for wrapping batchedFetch/useEffect to make it easy to grab remote
 * resources from URLs. Probably should have use useSWR or something similar
 * instead of rolling my own.
 *
 * Caches the result forever.
 */
export function useFetch(url: string): FetchState<Response> {
  const getResource = useCallback(() => batchedFetch(url), [url])
  return useRemoteResource(getResource)
}
