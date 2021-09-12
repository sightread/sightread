import React, { useState, useEffect, useContext, useCallback, useRef, useMemo } from 'react'
import { getSongSettings } from 'src/persist'
import { SongSettings, TrackSettings } from '../types'
import { breakpoints, isBrowser } from '../utils'

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
  const withSaved = useMemo(() => {
    const tracks = getSongSettings(file)
    if (!tracks) {
      return songSettings
    }
    return { song: songSettings?.song, tracks }
  }, [file, songSettings])
  return [withSaved, setSongSettings]
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
