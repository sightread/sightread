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
  base: 'flex items-center text-start gap-4 w-full cursor-default border border-black/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] rounded-lg pl-3 pr-2 py-2 transition bg-gray-50 max-h-full max-w-full',
  variants: {
    isDisabled: {
      false: 'text-gray-800  hover:bg-gray-100 pressed:bg-gray-200 group-invalid:border-red-600',
      true: 'text-gray-200',
    },
  },
})

export interface SelectProps_<T extends object> extends Omit<AriaSelectProps<T>, 'children'> {
  label?: string
  description?: string
  errorMessage?: string | ((validation: ValidationResult) => string)
  isLoading?: boolean
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
  ...props
}: SelectProps<T>) {
  return (
    <AriaSelect
      {...props}
      className={composeTailwindRenderProps(props.className, 'group relative flex flex-col gap-1')}
      isDisabled={props.isDisabled || isLoading}
    >
      {label && <Label>{label}</Label>}
      <Button className={styles}>
        <SelectValue className="flex-1 text-sm placeholder-shown:italic" />
        {isLoading ? (
          <LoaderCircle className="animate-spin" />
        ) : (
          <ChevronDown aria-hidden className="h-4 w-4 text-gray-600 group-disabled:text-gray-200" />
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
