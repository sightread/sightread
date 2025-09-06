import { PlayerProvider } from '@/features/player'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { Provider as JotaiProvider } from 'jotai'
import { PropsWithChildren } from 'react'

export function Providers({ children }: PropsWithChildren<{}>) {
  return (
    <JotaiProvider>
      <PlayerProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </PlayerProvider>
    </JotaiProvider>
  )
}
