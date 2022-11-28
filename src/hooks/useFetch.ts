import { batchedFetch, ResponseHandler } from '@/utils'
import { useEffect, useReducer } from 'react'

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

function defaultHandler<T>(response: Response): Promise<T> {
  return response.json()
}

/**
 * A hook wrapper for fetch. Currently only supports basic GETs.
 * Automatically batches requests to the same URL.
 * Caches the result forever.
 */
export default function useFetch<T>(
  url?: string,
  handler: ResponseHandler<T> = defaultHandler,
): FetchState<T> {
  const [state, dispatch] = useReducer<typeof reducer<T>>(reducer, { status: 'idle' })

  useEffect(() => {
    if (!url || !handler) {
      return
    }
    dispatch({ type: 'pending' })
    batchedFetch(url, handler)
      .then((data: T) => dispatch({ type: 'success', data }))
      .catch((error: Error) => dispatch({ type: 'error', error }))
  }, [url, handler])

  return state
}
