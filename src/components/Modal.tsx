'use client'

import { useEventListener, useWhenClickedOutside } from '@/hooks'
import { X as XMark } from '@/icons'
import clsx from 'clsx'
import { PropsWithChildren, useEffect, useRef } from 'react'

type ModalProps = {
  show: boolean
  onClose: () => void
  className?: string
}

function enableScrolling() {
  document.body.style.overflow = 'initial'
}
function disableScrolling() {
  document.body.style.overflow = 'hidden'
}

export default function Modal({
  show,
  children,
  onClose,
  className,
}: PropsWithChildren<ModalProps>) {
  const modalRef = useRef<HTMLDivElement>(null)

  useWhenClickedOutside(() => onClose?.(), modalRef)
  useEventListener<KeyboardEvent>('keydown', (event) => {
    if (show && event.key === 'Escape') {
      onClose?.()
    }
  })

  // Stop background from scrolling while modal is open.
  useEffect(() => {
    if (show) {
      disableScrolling()
    } else {
      enableScrolling()
    }
    return enableScrolling
  }, [show])

  if (!show) {
    return null
  }

  return (
    <div className="fixed left-0 top-0 z-20 flex h-full w-full items-center justify-center overflow-auto bg-gray-400/60 md:p-10">
      <div
        ref={modalRef}
        className={clsx(
          className,
          'relative z-10 m-auto max-w-(--breakpoint-lg) overflow-hidden rounded-md bg-white',
        )}
      >
        <button
          className="absolute right-5 top-5 z-10 text-purple-primary hover:text-purple-hover"
          onClick={onClose}
        >
          <XMark height={24} width={24} />
        </button>
        {children}
      </div>
    </div>
  )
}
