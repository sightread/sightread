import React, { useState, useEffect, useContext, useCallback } from 'react'
import Player from '../player'
import { SongNote } from '../parsers'
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

export const PlayerContext = React.createContext({
  player: (null as unknown) as any,
})

const UserPressedKeysContext = React.createContext<Map<number, number>>(new Map())

export function UserPressedKeysProvider({ children }: any) {
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
    player.subscribe((keys: any) => {
      setPressedKeys(keys)
    })
    return () => {
      player.unsubscribe(setPressedKeys)
    }
  }, [])

  return (
    <SongPressedKeysContext.Provider value={pressedKeys}>
      {children}
    </SongPressedKeysContext.Provider>
  )
}

export function usePlayer(): { player: Player } {
  return useContext(PlayerContext)
}

export function useSongPressedKeys() {
  return useContext(SongPressedKeysContext)
}

export function useUserPressedKeys() {
  return useContext(UserPressedKeysContext)
}

let player: Player
function getPlayer() {
  if (player === undefined) {
    player = new Player()
  }
  return player
}

export function PlayerProvider(props: any) {
  const value = { player: getPlayer() }

  return <PlayerContext.Provider value={value}>{props.children}</PlayerContext.Provider>
}
