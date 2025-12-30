import { PlayerProvider } from '@/features/player'
import * as RadixToast from '@radix-ui/react-toast'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { PropsWithChildren } from 'react'

export function Providers({ children }: PropsWithChildren<{}>) {
  return (
    <PlayerProvider>
      <RadixToast.ToastProvider swipeDirection="right" duration={2000}>
        {children}
      </RadixToast.ToastProvider>
    </PlayerProvider>
  )
}
