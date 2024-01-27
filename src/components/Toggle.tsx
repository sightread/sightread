'use client'
import clsx from 'clsx'
import { useCallback, useState } from 'react'

type ToggleProps = {
  checked?: boolean
  onChange?: (value: boolean) => void
  width?: number
  height?: number
  className?: string
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
    <label className={clsx(props.className, 'relative')} style={{ width, height }}>
      <input
        type="checkbox"
        className="opacity-0 w-0 h-0"
        onClick={toggleCheckedAndNotify}
        style={{ margin: 0 }}
      />
      <span
        className={clsx(
          'absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 transition rounded-2xl',
          checked && '!bg-purple-primary',
        )}
      />
      <span
        className={clsx(
          'absolute h-4 w-4 left-0 rounded-[50%] bg-white transition-all mx-1',
          'top-1/2 -translate-y-1/2',
          checked && '!left-[calc(100%-25px)]',
        )}
        style={{ transform: 'translateY(-50%)' }}
      />
    </label>
  )
}
