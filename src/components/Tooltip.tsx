'use client'
import React, { PropsWithChildren } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

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
          className="bg-purple-primary text-white py-1 px-2 rounded-md text-sm"
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
