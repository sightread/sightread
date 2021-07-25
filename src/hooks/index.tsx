import React, { useState, useEffect, useContext, useCallback, useRef, useMemo } from 'react'
import { SongSettings, TrackSettings } from '../types'
import { isBrowser } from '../utils'

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

type ProviderProps = {
  children: React.ReactNode
}

type SongSettingsContext = [SongSettings | null, (key: string, value: SongSettings) => void | null]
const SongSettingsContext = React.createContext<SongSettingsContext>([null, () => {}])

export function cachedSettings(key: string): TrackSettings | null {
  if (!isBrowser()) return null
  return JSON.parse(window.localStorage.getItem(key) ?? '')
}

export function SongSettingsProvider({ children }: ProviderProps) {
  const [songSettings, setSongSettings] = useState<SongSettings | null>(null)

  const handleSetWithCache = useCallback((key: string, settings: SongSettings): void => {
    if (isBrowser()) {
      try {
        window.localStorage.setItem(key, JSON.stringify(settings.tracks))
      } catch (e) {
        console.error('setItem failed', e)
      }
    }
    setSongSettings(settings)
  }, [])

  return (
    <SongSettingsContext.Provider value={[songSettings, handleSetWithCache]}>
      {children}
    </SongSettingsContext.Provider>
  )
}

// TODO: redo this function, it is awful.
export function useSelectedSong(file: string | null): SongSettingsContext {
  const [songSettings, setSongSettings] = useContext(SongSettingsContext)
  // TODO: solve bug re. inf loop.
  // const withCachedTrack = useMemo(() => {
  //   if (file) {
  //     const cached = cachedSettings(file)
  //     if (cached) {
  //       return { ...songSettings, tracks: cached }
  //     }
  //   }
  //   return songSettings
  // }, [file, songSettings])
  return [songSettings as any, setSongSettings]
}

// TODO: should this just be a useMemo?
export function useSingleton<T>(fn: () => T): T {
  let ref = useRef<T>()
  if (!ref.current) {
    ref.current = fn()
  }
  return ref.current
}
