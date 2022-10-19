import Player from '@/features/player'
import { useRef, useEffect, useReducer, useCallback, useMemo } from 'react'

type PlayerState = 'CannotPlay' | 'CanPlay' | 'Playing' | 'Paused'
type Action = 'ready' | 'play' | 'pause' | 'reset'

// Side effecting :'(
function reducer(state: PlayerState, action: Action): PlayerState {
  if (state === 'CannotPlay' || action === 'ready') {
    return action === 'ready' ? 'CanPlay' : 'CannotPlay'
  } else if (action === 'reset') {
    Player.player().stop()
    return 'CannotPlay'
  } else if (action === 'play') {
    Player.player().play()
    return 'Playing'
  } else if (action === 'pause') {
    Player.player().pause()
    return 'Paused'
  }

  throw new Error(`This should not happen. State: ${state}, Action: ${action}`)
}

type PlayerStateHookReturn = [
  { canPlay: boolean; playing: boolean; paused: boolean },
  {
    play: () => void
    pause: () => void
    reset: () => void
    ready: () => void
    toggle: () => void
  },
]

export default function usePlayerState(): PlayerStateHookReturn {
  const [state, dispatch] = useReducer(reducer, 'CannotPlay')

  const canPlay = state !== 'CannotPlay'
  const playing = state === 'Playing'
  const paused = state === 'Paused'

  const play = useCallback(() => dispatch('play'), [])
  const pause = useCallback(() => dispatch('pause'), [])
  const reset = useCallback(() => dispatch('reset'), [])
  const ready = useCallback(() => dispatch('ready'), [])
  const toggle = useCallback(() => dispatch(playing ? 'pause' : 'play'), [playing])

  const retValue: PlayerStateHookReturn = useMemo(
    () => [
      { canPlay, playing, paused },
      { play, pause, reset, ready, toggle },
    ],
    [canPlay, playing, paused],
  )

  return retValue
}
