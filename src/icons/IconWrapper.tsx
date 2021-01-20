import { CSSProperties, MouseEvent } from 'react'
import { css } from '../flakecss'

type IconWrapper = {
  onClick?: (e: MouseEvent) => void
  style?: CSSProperties
  className?: string
}

const classes = css({
  wrapper: {
    width: '35px',
    height: '35px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    transition: '120ms',
    outline: 'none',
    '&:hover': {
      backgroundColor: '#ccc',
    },
  },
})

function IconWrapper({
  onClick,
  style,
  className,
  children,
}: React.PropsWithChildren<IconWrapper>) {
  const handleClick = (e: MouseEvent) => {
    e.stopPropagation()
    if (onClick) {
      onClick(e)
    }
  }

  return (
    <span className={`${classes.wrapper} ${className}`} style={style} onClick={handleClick}>
      {children}
    </span>
  )
}

export default IconWrapper
