import Player, { PlayerState } from '@/features/player'
import { useMemo, useState, useEffect } from 'react'

type PlayerDispatcher = {
  play: () => void
  pause: () => void
  reset: () => void
  toggle: () => void
  restart: () => void
}

type PlayerStateHookReturn = [
  { canPlay: boolean; playing: boolean; paused: boolean },
  PlayerDispatcher,
]

export default function usePlayerState(): PlayerStateHookReturn {
  const player = Player.player()
  const [state, setState] = useState<PlayerState>(player.state)

  useEffect(() => {
    const handleStateChange = (s: PlayerState) => {
      setState(s)
    }
    player.subscribe(handleStateChange)
    return () => player.unsubscribe(handleStateChange)
  }, [player])

  const isLoading = state === 'CannotPlay'
  const canPlay = !isLoading
  const playing = state === 'Playing'
  const paused = state === 'Paused'

  const playerActions: PlayerDispatcher = useMemo(
    () => ({
      play: () => player.play(),
      pause: () => player.pause(),
      reset: () => player.stop(),
      toggle: () => player.toggle(),
      restart: () => player.seek(0),
    }),
    [player],
  )

  return useMemo(() => {
    return [{ canPlay, playing, paused }, playerActions]
  }, [canPlay, playing, paused, playerActions])
}
