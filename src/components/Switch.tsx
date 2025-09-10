import React from 'react'
import { Switch as AriaSwitch, SwitchProps as AriaSwitchProps } from 'react-aria-components'
import { tv } from 'tailwind-variants'
import { composeTailwindRenderProps, Expand, focusRing } from './utils'

interface SwitchProps_ extends Omit<AriaSwitchProps, 'children'> {
  children: React.ReactNode
}
export type SwitchProps = Expand<SwitchProps_>

const track = tv({
  extend: focusRing,
  base: 'flex h-4 w-7 px-px items-center shrink-0 cursor-default rounded-full transition duration-200 ease-in-out shadow-inner border border-transparent',
  variants: {
    isSelected: {
      false: 'bg-gray-400 group-pressed:bg-gray-500',
      true: 'bg-violet-600 group-pressed:bg-violet-700',
    },
    isDisabled: {
      true: 'bg-gray-200',
    },
  },
})

const handle = tv({
  base: 'h-3 w-3 transform rounded-full bg-white outline -outline-offset-1 outline-transparent shadow-xs transition duration-200 ease-in-out',
  variants: {
    isSelected: {
      false: 'translate-x-0',
      true: 'translate-x-[100%]',
    },
  },
})

export function Switch({ children, ...props }: SwitchProps) {
  return (
    <AriaSwitch
      {...props}
      className={composeTailwindRenderProps(
        props.className,
        'group relative flex items-center gap-2 text-sm text-gray-800 transition disabled:text-gray-300',
      )}
    >
      {(renderProps) => (
        <>
          <div className={track(renderProps)}>
            <span className={handle(renderProps)} />
          </div>
          {children}
        </>
      )}
    </AriaSwitch>
  )
}
