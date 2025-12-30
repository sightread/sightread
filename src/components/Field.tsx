import {
  composeRenderProps,
  FieldErrorProps,
  Group,
  GroupProps,
  InputProps,
  LabelProps,
  FieldError as RACFieldError,
  Input as RACInput,
  Label as RACLabel,
  Text,
  TextProps,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'
import { tv } from 'tailwind-variants'
import { composeTailwindRenderProps, focusRing } from './utils'

export function Label(props: LabelProps) {
  return (
    <RACLabel
      {...props}
      className={twMerge('w-fit cursor-default text-sm font-medium text-gray-500', props.className)}
    />
  )
}

export function Description(props: TextProps) {
  return (
    <Text
      {...props}
      slot="description"
      className={twMerge('text-sm text-gray-600', props.className)}
    />
  )
}

export function FieldError(props: FieldErrorProps) {
  return (
    <RACFieldError
      {...props}
      className={composeTailwindRenderProps(props.className, 'text-sm text-red-600')}
    />
  )
}

export const fieldBorderStyles = tv({
  variants: {
    isFocusWithin: {
      false: 'border-gray-300',
      true: 'border-gray-600',
    },
    isInvalid: {
      true: 'border-red-600',
    },
    isDisabled: {
      true: 'border-gray-200',
    },
  },
})

export const fieldGroupStyles = tv({
  extend: focusRing,
  base: 'group flex items-center h-9 bg-white border-2 rounded-lg overflow-hidden',
  variants: fieldBorderStyles.variants,
})

export function FieldGroup(props: GroupProps) {
  return (
    <Group
      {...props}
      className={composeRenderProps(props.className, (className, renderProps) =>
        fieldGroupStyles({ ...renderProps, className }),
      )}
    />
  )
}

export function Input(props: InputProps) {
  return (
    <RACInput
      {...props}
      className={composeTailwindRenderProps(
        props.className,
        'min-w-0 flex-1 bg-white px-2 py-1.5 text-sm text-gray-800 outline disabled:text-gray-200',
      )}
    />
  )
}
