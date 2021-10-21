import React, { useState, useEffect, useCallback, useRef } from 'react'
import { breakpoints } from '@/utils'

export function useRAFLoop(fn: Function) {
  const requestRef: any = React.useRef()
  const previousTimeRef: any = React.useRef()

  const animate = useCallback(
    (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current
        fn(deltaTime)
      }
      previousTimeRef.current = time
      requestRef.current = requestAnimationFrame(animate)
    },
    [fn],
  )

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(requestRef.current)
  }, [animate]) // Make sure the effect runs only once
}

// TODO: should this just be a useMemo?
export function useSingleton<T>(fn: () => T): T {
  let ref = useRef<T>()
  if (!ref.current) {
    ref.current = fn()
  }
  return ref.current
}

export function useWindowWidth(): number {
  const [windowWidth, setWindowWidth] = useState<number>(breakpoints.md)
  useEffect(() => {
    const width = window.innerWidth
    setWindowWidth(width)
    const resizeHandler = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', resizeHandler)
    return function cleanup() {
      window.removeEventListener('resize', resizeHandler)
    }
  }, [])

  return windowWidth
}
