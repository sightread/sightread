import React from 'react'
import { Switch as AriaSwitch, SwitchProps as AriaSwitchProps } from 'react-aria-components'
import { tv } from 'tailwind-variants'
import { composeTailwindRenderProps, Expand, focusRing } from './utils'

interface SwitchProps_ extends Omit<AriaSwitchProps, 'children'> {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}
export type SwitchProps = Expand<SwitchProps_>

const track = tv({
  extend: focusRing,
  base: 'flex px-px items-center shrink-0 cursor-default rounded-full transition duration-200 ease-in-out shadow-inner border border-transparent',
  variants: {
    isSelected: {
      false: 'bg-gray-400 group-pressed:bg-gray-500',
      true: 'bg-violet-600 group-pressed:bg-violet-700',
    },
    isDisabled: {
      true: 'bg-gray-200',
    },
    size: {
      sm: 'h-4 w-7',
      md: 'h-5 w-9',
      lg: 'h-6 w-11',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
})

const handle = tv({
  base: 'transform rounded-full bg-white outline -outline-offset-1 outline-transparent shadow-xs transition duration-200 ease-in-out',
  variants: {
    isSelected: {
      false: 'translate-x-0',
      true: 'translate-x-[100%]',
    },
    size: {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
})

export function Switch({ children, size = 'sm', ...props }: SwitchProps) {
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
          <div className={track({ ...renderProps, size })}>
            <span className={handle({ ...renderProps, size })} />
          </div>
          {children}
        </>
      )}
    </AriaSwitch>
  )
}
