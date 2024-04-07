'use client'

import { PlayerProvider } from '@/features/player'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { Provider as JotaiProvider } from 'jotai'
import { PropsWithChildren } from 'react'

// By default, Jotai uses a single global store. This creates problems during
// Next.js SSR where state could accidentally leak between requests for
// different clients. <JotaiProvider> below creates a tree-scoped jotai store.
// See https://jotai.org/docs/guides/nextjs

export function Providers({ children }: PropsWithChildren<{}>) {
  return (
    <JotaiProvider>
      <PlayerProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </PlayerProvider>
    </JotaiProvider>
  )
}
