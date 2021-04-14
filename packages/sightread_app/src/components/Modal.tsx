import { PropsWithChildren, CSSProperties } from 'react'
import { palette } from '../styles/common'
import { css } from '@sightread/flakecss'
import { CancelCircleIcon } from '../icons'

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
    transition: '300ms',
    opacity: 1,
  },
  modalContent: {
    border: '1px solid #888',
    maxWidth: 1100,
    padding: '40px 32px 32px 32px',
    margin: 'auto',
    backgroundColor: 'white',
    zIndex: 2,
    borderRadius: 5,
    position: 'relative',
  },
  closeModalButton: {
    cursor: 'pointer',
    float: 'right',
    border: 'none',
    background: 'none',
    position: 'absolute',
    top: '5px',
    right: '2px',
    '&:focus': {
      outline: 'none',
    },
  },
  closeModalIcon: {
    transition: '150ms',
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

function Modal({ show, children, onClose, style }: PropsWithChildren<ModalProps>) {
  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  const modalStyle = () => {
    if (!show) {
      return { opacity: 0, zIndex: -100, display: 'none' }
    }
    return { opacity: 1, zIndex: 10 }
  }

  const handleOuterClick = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <div className={classes.modalContainer} style={modalStyle()} onClick={handleOuterClick}>
      <div
        //   ref={modalRef}
        className={classes.modalContent}
        style={{ zIndex: 11, ...style }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <button className={classes.closeModalButton} onClick={handleClose}>
          <CancelCircleIcon width={30} height={30} className={classes.closeModalIcon} />
        </button>
        {children}
      </div>
    </div>
  )
}

export default Modal
