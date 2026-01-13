import { ChevronDown, LoaderCircle } from 'lucide-react'
import React from 'react'
import {
  Select as AriaSelect,
  SelectProps as AriaSelectProps,
  Button,
  ListBox,
  ListBoxItemProps,
  SelectValue,
  ValidationResult,
} from 'react-aria-components'
import { tv } from 'tailwind-variants'
import { Description, FieldError, Label } from './Field'
import { DropdownItem, DropdownSection, DropdownSectionProps } from './ListBox'
import { Popover } from './Popover'
import { composeTailwindRenderProps, Expand, focusRing } from './utils'

const styles = tv({
  extend: focusRing,
  base: 'relative flex w-full items-center rounded-md border border-zinc-700 bg-zinc-900/70 text-start text-zinc-200 transition hover:bg-zinc-900/80 max-w-full',
  variants: {
    size: {
      sm: 'h-6 pl-2 pr-7 text-[10px] font-semibold',
      md: 'h-7 pl-2 pr-7 text-[11px] font-medium',
      lg: 'h-8 pl-3 pr-8 text-xs font-medium',
    },
    isDisabled: {
      false: 'cursor-pointer',
      true: 'cursor-not-allowed text-gray-500',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export interface SelectProps_<T extends object> extends Omit<AriaSelectProps<T>, 'children'> {
  label?: string
  description?: string
  errorMessage?: string | ((validation: ValidationResult) => string)
  isLoading?: boolean
  size?: 'sm' | 'md' | 'lg'
  items?: Iterable<T>
  children: React.ReactNode | ((item: T) => React.ReactNode)
}
type SelectProps<T extends object> = Expand<SelectProps_<T>>

export function Select<T extends object>({
  label,
  description,
  errorMessage,
  children,
  items,
  isLoading = false,
  size = 'md',
  ...props
}: SelectProps<T>) {
  return (
    <AriaSelect
      {...props}
      className={composeTailwindRenderProps(props.className, 'group relative flex flex-col gap-1')}
      isDisabled={props.isDisabled || isLoading}
    >
      {label && <Label>{label}</Label>}
      <Button className={(renderProps) => styles({ ...renderProps, size })}>
        <SelectValue className="min-w-0 flex-1 truncate text-zinc-200" />
        {isLoading ? (
          <LoaderCircle className="absolute top-1/2 right-2 h-3 w-3 -translate-y-1/2 animate-spin text-zinc-400" />
        ) : (
          <ChevronDown
            aria-hidden
            className="absolute top-1/2 right-2 h-2.5 w-2.5 -translate-y-1/2 text-zinc-400 group-disabled:text-zinc-500"
          />
        )}
      </Button>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover className="min-w-(--trigger-width)">
        <ListBox
          items={items}
          className="max-h-[inherit] overflow-auto p-1 outline-hidden [clip-path:inset(0_0_0_0_round_.75rem)]"
        >
          {children}
        </ListBox>
      </Popover>
    </AriaSelect>
  )
}

export function SelectItem(props: ListBoxItemProps) {
  return <DropdownItem {...props} />
}

export function SelectSection<T extends object>(props: DropdownSectionProps<T>) {
  return <DropdownSection {...props} />
}
