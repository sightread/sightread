'use client'

import { ChevronDown, ChevronUp } from '@/icons'
import * as React from 'react'

type PercentOrPx = number | `${number}%`

type MovablePopupProps = {
  initialPosition?: { x: PercentOrPx; y: PercentOrPx }
  header: React.ReactNode
  children: React.ReactNode
}

function resolvePosition(value: PercentOrPx, axis: 'x' | 'y', popupW: number, popupH: number) {
  const size = axis === 'x' ? window.innerWidth : window.innerHeight
  const popupSize = axis === 'x' ? popupW : popupH
  const pos = typeof value === 'number' ? value : size * (parseFloat(value) / 100) - popupSize
  return Math.max(0, Math.min(pos, size - popupSize))
}

export default function MovablePopup({
  initialPosition = { x: 0, y: 0 },
  header,
  children,
}: MovablePopupProps) {
  const [expanded, setExpanded] = React.useState(false)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })

  const popupRef = React.useRef<HTMLDivElement>(null)
  const dragging = React.useRef(false)
  const offset = React.useRef({ x: 0, y: 0 })

  React.useEffect(() => {
    if (!popupRef.current) return
    const popupW = popupRef.current.offsetWidth
    const popupH = popupRef.current.offsetHeight
    setPosition({
      x: resolvePosition(initialPosition.x, 'x', popupW, popupH),
      y: resolvePosition(initialPosition.y, 'y', popupW, popupH),
    })
  }, [])

  React.useEffect(() => {
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

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!popupRef.current) return
    dragging.current = true
    const rect = popupRef.current.getBoundingClientRect()
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging.current || !popupRef.current) return
    const popup = popupRef.current
    const newX = Math.max(
      0,
      Math.min(e.clientX - offset.current.x, window.innerWidth - popup.offsetWidth),
    )
    const newY = Math.max(
      0,
      Math.min(e.clientY - offset.current.y, window.innerHeight - popup.offsetHeight),
    )
    popup.style.transform = `translate(${newX}px, ${newY}px)`
  }

  const handleMouseUp = () => {
    if (!dragging.current || !popupRef.current) return
    dragging.current = false
    const rect = popupRef.current.getBoundingClientRect()
    setPosition({ x: rect.left, y: rect.top })

    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
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
