import clsx from 'clsx'
import { useCallback, useRef, useState } from 'react'
import { css } from '@sightread/flake'
import { peek } from 'src/utils'

const classes = css({
  switch: {
    position: 'relative',
    display: 'inline-block',

    // Hide default HTML checkbox
    '& input': {
      opacity: 0,
      width: 0,
      height: 0,
    },
  },
  slider: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ccc',
    transition: '.4s',
    borderRadius: 20,
    '&.checked': {
      backgroundColor: '#2196F3',
    },
  },
  dot: {
    position: 'absolute',
    height: 15,
    width: 15,
    left: 4,
    bottom: 4,
    borderRadius: '50%',
    backgroundColor: 'white',
    transition: '.4s',
    '&.checked': {
      left: '60%',
    },
  },
})

type ToggleProps = {
  checked: boolean
  onChange: (value: boolean) => void
  width?: number
  height?: number
}
export default function Toggle(props: ToggleProps) {
  const [checked, setChecked] = useState(!!props.checked)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const width = props.width ?? 50
  const height = props.height ?? 24

  const handleClick = useCallback(() => {
    if (!inputRef.current) {
      return
    }
    setChecked((prev) => !prev)
  }, [])

  return (
    <label className={classes.switch} style={{ width, height }}>
      <input type="checkbox" ref={inputRef} onClick={handleClick} />
      <span className={clsx(classes.slider, { checked })}></span>
      <span className={clsx(classes.dot, { checked })}></span>
    </label>
  )
}
