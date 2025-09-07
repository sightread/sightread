import { useRef } from 'react'

/**
 * A custom hook to lazily initialize a value and get a stable reference to it.
 * The provided function `fn` is only called once during the component's initial render.
 * Subsequent re-renders will return the same value without re-running the initializer.
 */
export default function useLazyStableRef<T>(fn: () => T): T {
  const ref = useRef<T | null>(null)
  if (!ref.current) {
    ref.current = fn()
  }
  return ref.current as T
}
