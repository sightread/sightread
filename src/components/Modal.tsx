import { PropsWithChildren, CSSProperties, useEffect, useRef } from 'react'
import { palette } from '@/styles/common'
import { css, mediaQuery } from '@sightread/flake'
import { CancelCircleIcon } from '@/icons'
import clsx from 'clsx'
import { useWhenClickedOutside } from '@/hooks'

const classes = css({
  modalContainer: {
    position: 'fixed',
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
    [mediaQuery.up(500)]: {
      padding: 40,
    },
    [mediaQuery.down(500)]: {
      padding: 0,
    },
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
  classNames?: string
}

export default function Modal({
  show,
  children,
  onClose,
  style,
  classNames,
}: PropsWithChildren<ModalProps>) {
  const modalRef = useRef<HTMLDivElement>(null)

  useWhenClickedOutside(() => onClose?.(), modalRef, [])
  useEffect(() => {
    if (!show) {
      return
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
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  })
  const handleClose = () => {
    onClose?.()
  }

  if (!show) {
    return null
  }

  return (
    <div className={classes.modalContainer}>
      <div ref={modalRef} className={clsx(classNames, classes.modalContent)} style={style}>
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
