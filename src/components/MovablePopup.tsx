import { ChevronDown, ChevronUp } from '@/icons'
import React, { ReactNode, useEffect, useRef, useState } from 'react'

type PercentOrPx = number | `${number}%`

type MovablePopupProps = {
  initialPosition?: { x: PercentOrPx; y: PercentOrPx }
  header: ReactNode
  children: ReactNode
}

function getViewportSize(axis: 'x' | 'y'): number {
  if (typeof window === 'undefined') {
    return 0
  }
  return axis === 'x' ? window.innerWidth : window.innerHeight
}

function resolvePosition(value: PercentOrPx, axis: 'x' | 'y', popupW: number, popupH: number) {
  const size = getViewportSize(axis)
  const popupSize = axis === 'x' ? popupW : popupH

  if (size === 0) {
    // Non-DOM environment (tests, server, etc.) – just fall back to the raw value.
    return typeof value === 'number' ? value : 0
  }

  const pos = typeof value === 'number' ? value : size * (parseFloat(value) / 100) - popupSize
  return Math.max(0, Math.min(pos, size - popupSize))
}

export default function MovablePopup({
  initialPosition = { x: 0, y: 0 },
  header,
  children,
}: MovablePopupProps) {
  const [expanded, setExpanded] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const popupRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const offset = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!popupRef.current) return

    const popupW = popupRef.current.offsetWidth
    const popupH = popupRef.current.offsetHeight

    setPosition({
      x: resolvePosition(initialPosition.x, 'x', popupW, popupH),
      y: resolvePosition(initialPosition.y, 'y', popupW, popupH),
    })
  }, [initialPosition.x, initialPosition.y])

  useEffect(() => {
    if (typeof window === 'undefined') return

    function enforceBounds() {
      if (!popupRef.current) return
      const popupW = popupRef.current.offsetWidth
      const popupH = popupRef.current.offsetHeight
      setPosition((prev) => ({
        x: Math.max(0, Math.min(prev.x, window.innerWidth - popupW)),
        y: Math.max(0, Math.min(prev.y, window.innerHeight - popupH)),
      }))
    }

    window.addEventListener('resize', enforceBounds)
    return () => window.removeEventListener('resize', enforceBounds)
  }, [])

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging.current || !popupRef.current || typeof window === 'undefined') return

    const popup = popupRef.current
    const maxX = window.innerWidth - popup.offsetWidth
    const maxY = window.innerHeight - popup.offsetHeight

    const newX = Math.max(0, Math.min(e.clientX - offset.current.x, maxX))
    const newY = Math.max(0, Math.min(e.clientY - offset.current.y, maxY))

    popup.style.transform = `translate(${newX}px, ${newY}px)`
  }

  const handleMouseUp = () => {
    if (!dragging.current || !popupRef.current) return
    dragging.current = false

    const rect = popupRef.current.getBoundingClientRect()
    setPosition({ x: rect.left, y: rect.top })

    if (typeof document !== 'undefined') {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!popupRef.current || typeof document === 'undefined') return

    dragging.current = true
    const rect = popupRef.current.getBoundingClientRect()
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      ref={popupRef}
      className={`fixed z-50 w-[290px] cursor-grab rounded-xl bg-black/80 text-white shadow-2xl select-none`}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      onMouseDown={handleMouseDown}
    >
      <div className="relative flex w-full flex-col overflow-hidden">
        <div className="flex h-[40px] w-full cursor-grab items-center justify-between px-3">
          {header}
          <button
            className="ml-2 hover:opacity-70"
            onClick={(e) => {
              e.stopPropagation()
              setExpanded((prev) => !prev)
            }}
          >
            {expanded ? <ChevronUp /> : <ChevronDown />}
          </button>
        </div>

        <div
          className="overflow-hidden transition-[max-height] duration-300"
          style={{ maxHeight: expanded ? 200 : 0 }}
        >
          <div className="p-4 text-sm">{children}</div>
        </div>
      </div>
    </div>
  )
}
