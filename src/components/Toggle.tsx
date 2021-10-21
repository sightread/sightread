import clsx from 'clsx'
import { useCallback, useEffect, useRef, useState } from 'react'
import { css } from '@sightread/flake'
import { peek } from '@/utils'

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
    transition: 'left 400ms',
    borderRadius: 20,
    '&.checked': {
      backgroundColor: '#2196F3',
    },
  },
  dot: {
    position: 'absolute',
    height: 15,
    width: 15,
    top: '50%',
    transform: 'translateY(-50%)',
    left: 0,
    borderRadius: '50%',
    backgroundColor: 'white',
    transition: 'left 400ms',
    '&.checked': {
      left: 'calc(100% - 25px)',
    },
  },
})

type ToggleProps = {
  checked?: boolean
  onChange?: (value: boolean) => void
  width?: number
  height?: number
}
export default function Toggle(props: ToggleProps) {
  const [checkedState, setChecked] = useState(!!props.checked)
  const width = props.width ?? 50
  const height = props.height ?? 24
  const isControlled = props.checked != null
  const checked = isControlled ? props.checked : checkedState
  const { onChange } = props

  const toggleCheckedAndNotify = useCallback(() => {
    if (!isControlled) {
      setChecked(!checked)
    }
    onChange?.(!checked)
  }, [isControlled, checked, onChange])

  return (
    <label className={classes.switch} style={{ width, height }}>
      <input type="checkbox" onClick={toggleCheckedAndNotify} style={{ margin: 0 }} />
      <span className={clsx(classes.slider, { checked })} />
      <span className={clsx(classes.dot, { checked })} style={{ marginLeft: 5, marginRight: 5 }} />
    </label>
  )
}
