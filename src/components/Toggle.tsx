import { useRef, useState } from '@storybook/addons'
import { useCallback } from 'react'

type ToggleProps = {
  checked: boolean
  onChange: (value: boolean) => void
  width?: number
  height?: number
}
export default function Toggle(props: ToggleProps) {
  const [checked, setChecked] = useState(props.checked)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const width = props.width ?? 50
  const height = props.height ?? 24

  const handleClick = useCallback(
    (event: Event) => {
      if (!inputRef.current) {
        return
      }
      setChecked(!checked)
    },
    [props.checked],
  )

  return (
    <div className={classes} onClick={handleClick} ref={inputRef}>
      <div className="react-toggle-track">
        <div className="react-toggle-track-check">{this.getIcon('checked')}</div>
        <div className="react-toggle-track-x">{this.getIcon('unchecked')}</div>
      </div>
      <div className="react-toggle-thumb" />

      <input
        {...inputProps}
        ref={(ref) => {
          this.input = ref
        }}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        className="react-toggle-screenreader-only"
        type="checkbox"
      />
    </div>
  )
}
