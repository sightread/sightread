import {
  Popover as AriaPopover,
  PopoverProps as AriaPopoverProps,
  composeRenderProps,
  OverlayArrow,
  PopoverContext,
  useSlottedContext,
} from 'react-aria-components'
import { tv } from 'tailwind-variants'

export interface PopoverProps extends Omit<AriaPopoverProps, 'children'> {
  showArrow?: boolean
  ignoreTriggerOnInteractOutside?: boolean
  children: React.ReactNode
}

const styles = tv({
  base: 'bg-white shadow-2xl rounded-xl bg-clip-padding border border-black/10 text-slate-700',
  variants: {
    isEntering: {
      true: 'animate-in fade-in placement-bottom:slide-in-from-top-1 placement-top:slide-in-from-bottom-1 placement-left:slide-in-from-right-1 placement-right:slide-in-from-left-1 ease-out duration-100',
    },
    isExiting: {
      true: 'animate-out fade-out placement-bottom:slide-out-to-top-1 placement-top:slide-out-to-bottom-1 placement-left:slide-out-to-right-1 placement-right:slide-out-to-left-1 ease-in duration-100',
    },
  },
})

export function Popover({
  children,
  showArrow,
  className,
  ignoreTriggerOnInteractOutside,
  shouldCloseOnInteractOutside: shouldCloseOnInteractOutsideProp,
  ...props
}: PopoverProps) {
  let popoverContext = useSlottedContext(PopoverContext)!
  let isSubmenu = popoverContext?.trigger === 'SubmenuTrigger'
  let triggerRef = popoverContext?.triggerRef
  let offset = showArrow ? 12 : 8
  offset = isSubmenu ? offset - 6 : offset
  let shouldCloseOnInteractOutside = shouldCloseOnInteractOutsideProp
  if (ignoreTriggerOnInteractOutside && triggerRef) {
    shouldCloseOnInteractOutside = (element) => {
      if (triggerRef.current?.contains(element)) {
        return false
      }
      return shouldCloseOnInteractOutsideProp ? shouldCloseOnInteractOutsideProp(element) : true
    }
  }
  return (
    <AriaPopover
      offset={offset}
      {...props}
      shouldCloseOnInteractOutside={shouldCloseOnInteractOutside}
      className={composeRenderProps(className, (className, renderProps) =>
        styles({ ...renderProps, className }),
      )}
    >
      {showArrow && (
        <OverlayArrow className="group">
          <svg
            width={12}
            height={12}
            viewBox="0 0 12 12"
            className="group-placement-bottom:rotate-180 group-placement-left:-rotate-90 group-placement-right:rotate-90 block fill-white stroke-black/10 stroke-1"
          >
            <path d="M0 0 L6 6 L12 0" />
          </svg>
        </OverlayArrow>
      )}
      {children}
    </AriaPopover>
  )
}
