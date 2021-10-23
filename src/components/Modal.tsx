import { PropsWithChildren, CSSProperties, useEffect, useRef } from 'react'
import { palette } from '@/styles/common'
import { css } from '@sightread/flake'
import { CancelCircleIcon } from '@/icons'

const classes = css({
  modalContainer: {
    position: 'fixed',
    padding: 40,
    boxSizing: 'border-box',
    zIndex: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    left: 0,
    top: 0,
    width: '100%' /* Full width */,
    height: '100%' /* Full height */,
    overflow: 'auto' /* Enable scroll if needed */,
    backgroundColor: 'rgba(126,126,126, 0.65)' /* Fallback color */,
  },
  modalContent: {
    border: '1px solid #888',
    maxWidth: 1100,
    padding: '0 32px 0px 32px',
    margin: 'auto',
    backgroundColor: 'white',
    zIndex: 2,
    borderRadius: 5,
  },
  closeButtonWrapper: {
    padding: '16px 0 0 0',
    display: 'flex',
    '& button': {
      justifyContent: 'flex-end',
    },
  },
  closeModalButton: {
    cursor: 'pointer',
    marginLeft: 'auto',
    border: 'none',
    background: 'none',
    outline: 'none',
  },
  closeModalIcon: {
    transition: '150ms',
    outline: 'none',
    '&:hover path': {
      fill: palette.purple.dark,
    },
  },
})

type ModalProps = {
  show: boolean
  onClose?: () => void
  style?: CSSProperties
}

export default function Modal({ show, children, onClose, style }: PropsWithChildren<ModalProps>) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!show) {
      return
    }

    function outsideClickHandler(e: MouseEvent) {
      if (!modalRef.current) {
        return
      }
      if (!modalRef.current.contains(e.target as Node)) {
        if (onClose) {
          onClose()
        }
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (!modalRef.current || !onClose) {
        return
      }
      const keyPressed = e.key

      if (keyPressed === 'Escape') {
        return onClose()
      }
    }
    window.addEventListener('mousedown', outsideClickHandler)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('mousedown', outsideClickHandler)
      window.removeEventListener('keydown', handleKeyDown)
    }
  })
  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  if (!show) {
    return null
  }

  return (
    <div className={classes.modalContainer}>
      <div ref={modalRef} className={classes.modalContent} style={style}>
        <div className={classes.closeButtonWrapper}>
          <button className={classes.closeModalButton} onClick={handleClose}>
            <CancelCircleIcon width={30} height={30} className={classes.closeModalIcon} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
