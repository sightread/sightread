'use client'

import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import React, { PropsWithChildren } from 'react'

type TooltipProps = PropsWithChildren<{
  label: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: () => void
  [key: string]: any
}>

export function Tooltip({
  children,
  label,
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: TooltipProps) {
  return (
    <TooltipPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      delayDuration={0}
    >
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          className="rounded-md bg-purple-primary px-2 py-1 text-sm text-white"
          side="top"
          align="center"
          {...props}
        >
          {label}
          <TooltipPrimitive.Arrow width={11} height={5} className="fill-purple-primary" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
