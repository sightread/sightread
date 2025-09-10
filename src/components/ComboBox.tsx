'use client'

import { ChevronDown, LoaderCircle } from 'lucide-react'
import React from 'react'
import {
  ComboBox as AriaComboBox,
  ComboBoxProps as AriaComboBoxProps,
  Button,
  ListBox,
  ListBoxItemProps,
  Pressable,
  ValidationResult,
} from 'react-aria-components'
import { Description, FieldError, FieldGroup, Input, Label } from './Field'
import { DropdownItem, DropdownSection, DropdownSectionProps } from './ListBox'
import { Popover } from './Popover'
import { composeTailwindRenderProps } from './utils'

export interface ComboBoxProps<T extends object> extends Omit<AriaComboBoxProps<T>, 'children'> {
  label?: string
  description?: string | null
  isLoading?: boolean
  errorMessage?: string | ((validation: ValidationResult) => string)
  children: React.ReactNode | ((item: T) => React.ReactNode)
}

export function ComboBox<T extends object>({
  label,
  description,
  errorMessage,
  children,
  items,
  isLoading,
  ...props
}: ComboBoxProps<T>) {
  return (
    <AriaComboBox
      {...props}
      className={composeTailwindRenderProps(props.className, 'group flex flex-col gap-1')}
    >
      <Label>{label}</Label>
      <FieldGroup>
        <Input />
        <Button className="mr-1 flex w-6 items-center justify-center rounded-xs outline-offset-0">
          {isLoading ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <ChevronDown
              aria-hidden
              className="h-4 w-4 text-gray-600 group-disabled:text-gray-200"
            />
          )}
        </Button>
      </FieldGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover className="w-(--trigger-width)">
        <ListBox
          items={items}
          className="max-h-[inherit] overflow-auto p-1 outline-0 [clip-path:inset(0_0_0_0_round_.75rem)]"
        >
          {children}
        </ListBox>
      </Popover>
    </AriaComboBox>
  )
}

export function ComboBoxItem(props: ListBoxItemProps) {
  return <DropdownItem {...props} />
}

export function ComboBoxSection<T extends object>(props: DropdownSectionProps<T>) {
  return <DropdownSection {...props} />
}
