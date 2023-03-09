import { useWhenClickedOutside, useEventListener } from '@/hooks'
import clsx from 'clsx'
import { useState, useRef, useMemo } from 'react'

export function Dropdown({
  children,
  target,
  openOn = 'click',
}: React.PropsWithChildren<{ target: React.ReactElement; openOn?: 'hover' | 'click' }>) {
  const [open, setOpen] = useState<boolean>(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const toggleOpen = () => {
    setOpen(!open)
  }

  useWhenClickedOutside(() => setOpen(false), dropdownRef)
  useEventListener<KeyboardEvent>('keydown', (event) => {
    if (open && event.key === 'Escape') {
      setOpen(false)
    }
  })
  let wrapperEvents = useMemo(
    () => (openOn === 'hover' ? { onMouseEnter: toggleOpen, onMouseLeave: toggleOpen } : {}),
    [openOn, open],
  )
  let targetEvents = useMemo(
    () => (openOn === 'click' ? { onClick: toggleOpen } : {}),
    [openOn, open],
  )

  return (
    <div ref={dropdownRef} {...wrapperEvents}>
      <div className="cursor-pointer w-min" {...targetEvents}>
        {target}
      </div>
      <div className="relative">
        <div
          ref={menuRef}
          className={clsx(
            'absolute flex justify-center items-center top-1 rounded-lg overflow-hidden transition shadow-xl',
            !open && 'hidden',
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
