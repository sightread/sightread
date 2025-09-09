import { PlayerProvider } from '@/features/player'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { PropsWithChildren } from 'react'

export function Providers({ children }: PropsWithChildren<{}>) {
  return (
    <PlayerProvider>
      <TooltipProvider>{children}</TooltipProvider>
    </PlayerProvider>
  )
}
