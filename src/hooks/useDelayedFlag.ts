import { useEffect, useRef, useState } from 'react'

/**
 * Returns true only after `value` has been true for `delayMs` milliseconds.
 * Resets immediately when `value` becomes false.
 */
export default function useDelayedFlag(value: boolean, delayMs = 300): boolean {
  const [ready, setReady] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    // clear any pending timer
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }

    if (value) {
      // start delay; don't show immediately
      setReady(false)
      timer.current = globalThis.setTimeout(() => {
        setReady(true)
        timer.current = null
      }, delayMs) as unknown as number
    } else {
      // hide immediately
      setReady(false)
    }

    return () => {
      if (timer.current) {
        clearTimeout(timer.current)
        timer.current = null
      }
    }
  }, [value, delayMs])

  return ready
}
