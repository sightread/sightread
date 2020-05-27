import { useState, useEffect, useContext, useCallback } from "react"
import Player from "../player"
import React from "react"
import { SongNote } from "../utils"
import midi from "../midi"

export function useMousePressed() {
  const [isPressed, setIsPressed] = useState(false)
  window.addEventListener("mousedown", () => setIsPressed(true))
  window.addEventListener("mouseup", () => setIsPressed(false))

  return isPressed
}

export function useWindowSize() {
  function getSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }

  const [windowSize, setWindowSize] = useState(getSize)
  useEffect(() => {
    function handleResize() {
      setWindowSize(getSize())
    }

    window.addEventListener("resize", handleResize, { passive: true })
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return windowSize
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

// export function useRAFLoop(fn: Function) {
//   useEffect(() => {
//     let handle: any
//     function loop() {
//       fn()
//       handle = requestAnimationFrame(loop)
//     }

//     loop()
//     return () => {
//       cancelAnimationFrame(handle)
//     }
//   }, [fn])
// }

export const PlayerContext = React.createContext({
  player: (null as unknown) as any,
})

const UserPressedKeysContext = React.createContext<Set<number>>(new Set())
export function UserPressedKeysProvider({ children }: any) {
  const [pressedKeys, setPressedKeys] = useState<Set<number>>(new Set())

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

const SongPressedKeysContext = React.createContext<{ [noteValue: number]: SongNote }>({})
export function SongPressedKeysProvider({ children }: any) {
  const [pressedKeys, setPressedKeys] = useState<{ [noteValue: number]: SongNote }>({})

  useEffect(() => {
    player.subscribe(setPressedKeys)
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

const player = new Player()
export function PlayerProvider(props: any) {
  const value = { player }

  return <PlayerContext.Provider value={value}>{props.children}</PlayerContext.Provider>
}
