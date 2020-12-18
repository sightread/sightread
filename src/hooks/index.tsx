import React, { useState, useEffect, useContext, useCallback } from 'react'
import Player from '../player'
import { SongNote, SongSettings, TrackSettings } from '../types'
import midi from '../midi'
import { useRouter } from 'next/router'
import { isBrowser } from '../utils'

export function useMousePressed() {
  const [isPressed, setIsPressed] = useState(false)
  window.addEventListener('mousedown', () => setIsPressed(true))
  window.addEventListener('mouseup', () => setIsPressed(false))

  return isPressed
}

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
  const cached = window.localStorage.getItem(key)
  if (!cached) return null
  return JSON.parse(cached)
}

export function SongSettingsProvider({ children }: ProviderProps) {
  const [songSettings, setSongSettings] = useState<SongSettings | null>(null)

  const handleSetWithCache = (key: string, settings: SongSettings): void => {
    if (isBrowser()) {
      window.localStorage.setItem(key, JSON.stringify(settings.tracks))
    }
    setSongSettings(settings)
  }

  return (
    <SongSettingsContext.Provider value={[songSettings, handleSetWithCache]}>
      {children}
    </SongSettingsContext.Provider>
  )
}

export function useSelectedSong(file: string | null): SongSettingsContext {
  const [songSettings, setSongSettings] = useContext(SongSettingsContext)
  if (file) {
    const cached = cachedSettings(file)
    if (cached) return [{ ...songSettings, tracks: cached }, setSongSettings]
  }
  return [songSettings, setSongSettings]
}

const UserPressedKeysContext = React.createContext<Map<number, number>>(new Map())

export function UserPressedKeysProvider({ children }: ProviderProps) {
  const [pressedKeys, setPressedKeys] = useState<Map<number, number>>(new Map())

  useEffect(() => {
    midi.subscribe(setPressedKeys)
    return () => {
      midi.unsubscribe(setPressedKeys)
    }
  }, [])

  return (
    <UserPressedKeysContext.Provider value={pressedKeys}>
      {children}
    </UserPressedKeysContext.Provider>
  )
}

const SongPressedKeysContext = React.createContext<{ [note: number]: SongNote }>({})

export function SongPressedKeysProvider({ children }: any) {
  const [pressedKeys, setPressedKeys] = useState<{ [note: number]: SongNote }>({})

  useEffect(() => {
    Player.player().subscribe((keys: any) => {
      setPressedKeys(keys)
    })
    return () => {
      Player.player().unsubscribe(setPressedKeys)
    }
  }, [])

  return (
    <SongPressedKeysContext.Provider value={pressedKeys}>
      {children}
    </SongPressedKeysContext.Provider>
  )
}

export function useSongPressedKeys() {
  return useContext(SongPressedKeysContext)
}

export function useUserPressedKeys() {
  return useContext(UserPressedKeysContext)
}

export function useQuery(): any {
  const router = useRouter()
  if (!isBrowser()) {
    return [{}, () => {}]
  }
  const params = new URLSearchParams(window?.location?.search)
  return [
    Object.fromEntries(params.entries()),
    (key: string, value: string) => {
      params.set(key, value)
      router.push(window.location.pathname + '?' + params.toString())
    },
  ]
}
