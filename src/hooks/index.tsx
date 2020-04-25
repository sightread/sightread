import { useState, useEffect, useContext } from "react"
import Player from "../player"
import React from "react"

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

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return windowSize
}

export function useRAFLoop(fn: Function) {
  useEffect(() => {
    let handle: any
    function loop() {
      fn()
      handle = requestAnimationFrame(loop)
    }

    loop()
    return () => {
      cancelAnimationFrame(handle)
    }
  }, [fn])
}

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
