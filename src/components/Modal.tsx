import { PropsWithChildren, useEffect, useRef } from 'react'
import clsx from 'clsx'
import { useEventListener, useWhenClickedOutside } from '@/hooks'

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
    <div className="fixed z-20 flex justify-center items-center left-0 top-0 w-full h-full overflow-auto bg-gray-400/60 md:p-10">
      <div
        ref={modalRef}
        className={clsx(
          className,
          'border border-gray-600 max-w-screen-lg m-auto bg-white z-10 rounded-md overflow-hidden',
        )}
      >
        {children}
      </div>
    </div>
  )
}
