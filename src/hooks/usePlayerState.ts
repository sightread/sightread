import { usePlayer } from '@/features/player'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

type PlayerStateHookReturn = {
  canPlay: boolean
  playing: boolean
  paused: boolean
  countingDown: boolean
}

export default function usePlayerState(): PlayerStateHookReturn {
  const player = usePlayer()
  const state = useAtomValue(player.state)

  return useMemo(() => {
    return {
      canPlay: state !== 'CannotPlay',
      playing: state === 'Playing' || state === 'CountingDown',
      paused: state === 'Paused',
      countingDown: state === 'CountingDown',
    }
  }, [state])
}
