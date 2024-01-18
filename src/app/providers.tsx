'use client'
import { PropsWithChildren, ReactNode } from 'react'
import { TooltipProvider } from '@radix-ui/react-tooltip'

// Why doesn't ReactNode work? Likely need to update radix
export function Providers({ children }: { children: any }) {
  return <TooltipProvider>{children}</TooltipProvider>
}
