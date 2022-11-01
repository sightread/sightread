import React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

export function Tooltip({ children, content, open, defaultOpen, onOpenChange, ...props }: any) {
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
          {content}
          <TooltipPrimitive.Arrow width={11} height={5} className="fill-purple-primary" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
