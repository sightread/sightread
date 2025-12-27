import { useEffect, useRef } from 'react'

export type Hand = 'L' | 'R' | ' '
export type Finger = 0 | 1 | 2 | 3 | 4 | 5

interface NoteContextMenuProps {
  x: number
  y: number
  onSelect: (hand: Hand, finger: Finger) => void
  onClose: () => void
}

const fingerLabels = {
  1: '1: Thumb',
  2: '2: Index',
  3: '3: Middle',
  4: '4: Ring',
  5: '5: Pinky',
}

export function NoteContextMenu({ x, y, onSelect, onClose }: NoteContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <div
      ref={menuRef}
      className="fixed bg-gray-800 text-white rounded shadow-lg z-50 min-w-48"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <div className="p-2">
        <div className="text-xs text-gray-400 px-2 py-1">Left Hand</div>
        {[1, 2, 3, 4, 5].map((finger) => (
          <button
            key={`L-${finger}`}
            className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded text-sm"
            onClick={() => {
              onSelect('L', finger as Finger)
              onClose()
            }}
          >
            {fingerLabels[finger as keyof typeof fingerLabels]}
          </button>
        ))}

        <div className="border-t border-gray-700 my-2" />

        <div className="text-xs text-gray-400 px-2 py-1">Right Hand</div>
        {[1, 2, 3, 4, 5].map((finger) => (
          <button
            key={`R-${finger}`}
            className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded text-sm"
            onClick={() => {
              onSelect('R', finger as Finger)
              onClose()
            }}
          >
            {fingerLabels[finger as keyof typeof fingerLabels]}
          </button>
        ))}

        <div className="border-t border-gray-700 my-2" />

        <button
          className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded text-sm text-gray-400"
          onClick={() => {
            onSelect(' ', 0)
            onClose()
          }}
        >
          Clear
        </button>
      </div>
    </div>
  )
}
