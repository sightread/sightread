import { useStore } from 'jotai'
import { PropsWithChildren, createContext, useContext, useState } from 'react'
import { Player } from './player'

const PlayerContext = createContext<Player | null>(null)

export function PlayerProvider({ children }: PropsWithChildren<{}>) {
  const store = useStore()
  //  Can this be a ref?
  const [player, _] = useState(() => new Player(store))
  return <PlayerContext.Provider value={player}>{children}</PlayerContext.Provider>
}

export function usePlayer() {
  const player = useContext(PlayerContext)
  if (!player) {
    throw new Error('Missing PlayerProvider')
  }
  return player
}
