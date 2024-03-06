'use client'
import { PropsWithChildren } from 'react'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { Provider as JotaiProvider } from 'jotai'
import { isBrowser } from '@/utils'

// By default, Jotai uses a single global store. This creates problems during
// Next.js SSR where state could accidentally leak between requests for
// different clients. Therefore, on server-only we render an extra Provider
// which creates a store for just that request. See docs for details:
// https://jotai.org/docs/guides/nextjs
function MaybeJotaiProvider({ children }: PropsWithChildren<{}>) {
  // if (isBrowser()) {
  // TODO: maybe get rid of singletons so this actually makes sense?
  if (true) {
    return children
  }
  return <JotaiProvider>{children}</JotaiProvider>
}

export function Providers({ children }: PropsWithChildren<{}>) {
  // TooltipProvider should accept ReactNode...strange that it doesn't.
  return (
    <MaybeJotaiProvider>
      <TooltipProvider>{children as any}</TooltipProvider>
    </MaybeJotaiProvider>
  )
}
