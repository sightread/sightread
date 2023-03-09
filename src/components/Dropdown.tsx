import { useWhenClickedOutside, useEventListener } from '@/hooks'
import clsx from 'clsx'
import { useState, useRef, useMemo, useCallback } from 'react'

export function Dropdown({
  children,
  target,
  openOn = 'click',
}: React.PropsWithChildren<{ target: React.ReactElement; openOn?: 'hover' | 'click' }>) {
  const [open, setOpen] = useState<boolean>(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const toggleOpen = useCallback(() => {
    setOpen(!open)
  }, [open, setOpen])

  useWhenClickedOutside(() => setOpen(false), dropdownRef)
  useEventListener<KeyboardEvent>('keydown', (event) => {
    if (open && event.key === 'Escape') {
      setOpen(false)
    }
  })
  let wrapperEvents = useMemo(
    () => (openOn === 'hover' ? { onMouseEnter: toggleOpen, onMouseLeave: toggleOpen } : {}),
    [openOn, toggleOpen],
  )
  let targetEvents = useMemo(
    () => (openOn === 'click' ? { onClick: toggleOpen } : {}),
    [openOn, toggleOpen],
  )

  return (
    <div ref={dropdownRef} {...wrapperEvents} className="w-full">
      <div className="cursor-pointer w-min" {...targetEvents}>
        {target}
      </div>
      <div className="relative w-full">
        <div
          ref={menuRef}
          className={clsx(
            'absolute flex justify-center items-center transition shadow-xl w-full',
            !open && 'hidden',
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
