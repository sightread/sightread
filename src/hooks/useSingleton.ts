import { useRef } from 'react'

// TODO: should this just be a useMemo?
export default function useSingleton<T>(fn: () => T): T {
  let ref = useRef<T>(null)
  if (!ref.current) {
    ref.current = fn()
  }
  return ref.current
}
