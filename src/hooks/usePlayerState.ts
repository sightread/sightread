import { usePlayer } from '@/features/player'
import { useMemo } from 'react'
import { useAtomValue } from 'jotai'

type PlayerStateHookReturn = { canPlay: boolean; playing: boolean; paused: boolean }

export default function usePlayerState(): PlayerStateHookReturn {
  const player = usePlayer()
  const state = useAtomValue(player.state)

  return useMemo(() => {
    return {
      canPlay: state !== 'CannotPlay',
      playing: state === 'Playing',
      paused: state === 'Paused',
    }
  }, [state])
}
