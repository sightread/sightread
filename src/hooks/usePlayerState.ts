import Player from '@/features/player'
import { useReducer, useCallback, useMemo } from 'react'

type PlayerState = 'CannotPlay' | 'CanPlay' | 'Playing' | 'Paused'
type Action = 'ready' | 'play' | 'pause' | 'reset' | 'toggle' | 'restart'

// Side effecting :'(
function reducer(state: PlayerState, action: Action): PlayerState {
  const player = Player.player()

  if (state === 'CannotPlay' || action === 'ready') {
    return action === 'ready' ? 'CanPlay' : 'CannotPlay'
  } else if (action === 'reset') {
    player.stop()
    return 'CannotPlay'
  } else if (action === 'play' || (action === 'toggle' && state !== 'Playing')) {
    player.play()
    return 'Playing'
  } else if (action === 'pause' || (action === 'toggle' && state !== 'Paused')) {
    player.pause()
    return 'Paused'
  } else if (action === 'restart') {
    player.seek(0)
    player.pause()
    return 'CanPlay'
  }

  throw new Error(`This should not happen. State: ${state}, Action: ${action}`)
}

type PlayerDispatcher = {
  play: () => void
  pause: () => void
  reset: () => void
  ready: () => void
  toggle: () => void
  restart: () => void
}

type PlayerStateHookReturn = [
  { canPlay: boolean; playing: boolean; paused: boolean },
  PlayerDispatcher,
]

export default function usePlayerState(): PlayerStateHookReturn {
  const [state, dispatch] = useReducer(reducer, 'CannotPlay')

  const isLoading = state === 'CannotPlay'
  const canPlay = !isLoading
  const playing = state === 'Playing'
  const paused = state === 'Paused'

  const playerActions: PlayerDispatcher = useMemo(
    () => ({
      play: () => dispatch('play'),
      pause: () => dispatch('pause'),
      reset: () => dispatch('reset'),
      ready: () => dispatch('ready'),
      toggle: () => dispatch('toggle'),
      restart: () => dispatch('restart'),
    }),
    [],
  )

  return useMemo(() => {
    return [{ canPlay, playing, paused }, playerActions]
  }, [canPlay, playing, paused, playerActions])
}
