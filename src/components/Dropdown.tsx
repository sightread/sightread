import { useWhenClickedOutside, useEventListener } from '@/hooks'
import clsx from 'clsx'
import { useState, useRef, useCallback } from 'react'

export function Dropdown({
  children,
  target,
}: React.PropsWithChildren<{ target: React.ReactElement }>) {
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

  return (
    <div ref={dropdownRef} onClick={toggleOpen} className="w-full">
      <div className="cursor-pointer w-min">{target}</div>
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
