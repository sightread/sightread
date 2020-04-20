import { useState, useEffect } from "react"
import Player from "../player"

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

export function usePlayer(refreshMs: number) {
  const player: Player = (window as any).player
  const [pressedKeys, setPressedKeys] = useState({})
  const [measure, setMeasure] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setPressedKeys(player.getPressedKeys())
      setMeasure(player.getMeasure())
    }, refreshMs)
    return function cleanup() {
      clearInterval(id)
    }
  }, [player, refreshMs])

  return {
    play: player.play,
    pause: player.pause,
    seek: () => {},
    measure,
    pressedKeys,
    player,
  }
}
