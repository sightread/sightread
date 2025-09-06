import { useEventListener, useWhenClickedOutside } from '@/hooks'
import clsx from 'clsx'
import { useCallback, useMemo, useRef, useState } from 'react'

export function Dropdown({
  children,
  target,
  openOn = 'click',
}: React.PropsWithChildren<{ target: React.ReactElement; openOn?: 'hover' | 'click' }>) {
  const [open, setOpen] = useState<boolean>(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const toggleOpen = useCallback((state = !open) => setOpen(state), [open])

  useWhenClickedOutside(() => setOpen(false), dropdownRef)
  useEventListener<KeyboardEvent>('keydown', (event) => {
    if (open && event.key === 'Escape') {
      setOpen(false)
    }
  })
  let wrapperEvents = useMemo(() => {
    if (openOn !== 'hover') {
      return {}
    }

    let cancel: ReturnType<typeof setTimeout> | null = null
    function onMouseEnter() {
      clearTimeout(cancel!)
      toggleOpen(true)
    }
    // It's a bit jarring to remove a hover-based dropdown immediately.
    // It requires too much mouse precision
    function onMouseLeave() {
      cancel = setTimeout(() => toggleOpen(false), 250)
    }
    return { onMouseEnter, onMouseLeave }
  }, [openOn, toggleOpen])

  let targetEvents: React.HTMLAttributes<HTMLDivElement> = useMemo(
    () =>
      openOn === 'click'
        ? {
          onClick: (e) => {
            e.stopPropagation()
            toggleOpen()
          },
        }
        : {},
    [openOn, toggleOpen],
  )

  return (
    <div ref={dropdownRef} {...wrapperEvents}>
      <div className="w-min cursor-pointer" {...targetEvents}>
        {target}
      </div>
      <div className="relative">
        <div
          ref={menuRef}
          className={clsx(
            'absolute top-1 flex items-center justify-center overflow-hidden rounded-lg shadow-xl transition',
            !open && 'hidden',
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
