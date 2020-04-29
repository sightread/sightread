import { useState, useEffect, useContext, useCallback } from 'react'
import Player from '../player'
import React from 'react'

export function useMousePressed() {
  const [isPressed, setIsPressed] = useState(false)
  window.addEventListener('mousedown', () => setIsPressed(true))
  window.addEventListener('mouseup', () => setIsPressed(false))

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

    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
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

export function usePlayer(): { player: Player } {
  return useContext(PlayerContext)
}

export function usePressedKeys(): { [key: number]: any } {
  const [pressedKeys, setPressedKeys] = useState({})
  const { player } = usePlayer()
  ;(player as any).onChange = () => setPressedKeys(player.getPressedKeys())
  return pressedKeys
}

const player = new Player()
export function PlayerProvider(props: any) {
  const value = { player }

  return <PlayerContext.Provider value={value}>{props.children}</PlayerContext.Provider>
}
