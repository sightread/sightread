import { Check } from 'lucide-react'
import {
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  ListBoxProps as AriaListBoxProps,
  Collection,
  composeRenderProps,
  Header,
  ListBoxItemProps,
  ListBoxSection,
  SectionProps,
} from 'react-aria-components'
import { tv } from 'tailwind-variants'
import { composeTailwindRenderProps, focusRing } from './utils'

interface ListBoxProps<T> extends Omit<AriaListBoxProps<T>, 'layout' | 'orientation'> {}

export function ListBox<T extends object>({ children, ...props }: ListBoxProps<T>) {
  return (
    <AriaListBox
      {...props}
      className={composeTailwindRenderProps(
        props.className,
        'rounded-md bg-gray-800 p-1 outline-1 -outline-offset-1 outline-white/10',
      )}
    >
      {children}
    </AriaListBox>
  )
}

export const itemStyles = tv({
  extend: focusRing,
  base: 'group relative flex items-center gap-8 cursor-default select-none py-1.5 px-2.5 rounded-md will-change-transform text-sm',
  variants: {
    isSelected: {
      false: 'text-slate-700 hover:bg-slate-200 -outline-offset-2',
      true: 'bg-indigo-600 text-white [&:has(+[data-selected])]:rounded-b-none [&+[data-selected]]:rounded-t-none -outline-offset-4 outline-white',
    },
    isDisabled: {
      true: 'text-slate-300',
    },
  },
})

export function ListBoxItem(props: ListBoxItemProps) {
  let textValue =
    props.textValue || (typeof props.children === 'string' ? props.children : undefined)
  return (
    <AriaListBoxItem {...props} textValue={textValue} className={itemStyles}>
      {composeRenderProps(props.children, (children) => (
        <>
          {children}
          <div className="absolute right-4 bottom-0 left-4 hidden h-px bg-white/20 [.group[data-selected]:has(+[data-selected])_&]:block" />
        </>
      ))}
    </AriaListBoxItem>
  )
}

export const dropdownItemStyles = tv({
  base: 'group flex items-center gap-4 cursor-default select-none py-2 pl-3 pr-1 rounded-lg text-sm',
  variants: {
    isDisabled: {
      false: 'text-gray-900',
      true: 'text-gray-300',
    },
    isFocused: {
      true: 'bg-indigo-600 text-white',
    },
  },
  compoundVariants: [
    {
      isFocused: false,
      isOpen: true,
      className: 'bg-gray-100',
    },
  ],
})

export function DropdownItem(props: ListBoxItemProps) {
  let textValue =
    props.textValue || (typeof props.children === 'string' ? props.children : undefined)
  return (
    <AriaListBoxItem {...props} textValue={textValue} className={dropdownItemStyles}>
      {composeRenderProps(props.children, (children, { isSelected }) => (
        <>
          <span className="group-selected:font-semibold flex flex-1 items-center gap-2 truncate font-normal">
            {children}
          </span>
          <span className="flex w-5 items-center">
            {isSelected && <Check className="h-4 w-4" />}
          </span>
        </>
      ))}
    </AriaListBoxItem>
  )
}

export interface DropdownSectionProps<T> extends SectionProps<T> {
  title?: string
  items?: any
}

export function DropdownSection<T extends object>(props: DropdownSectionProps<T>) {
  return (
    <ListBoxSection className="after:block after:h-[5px] after:content-[''] first:-mt-[5px]">
      <Header className="sticky -top-[5px] z-10 -mx-1 -mt-px truncate border-y border-y-gray-200 bg-gray-100/60 px-4 py-1 text-sm font-semibold text-gray-500 backdrop-blur-md supports-[-moz-appearance:none]:bg-gray-100">
        {props.title}
      </Header>
      <Collection items={props.items}>{props.children}</Collection>
    </ListBoxSection>
  )
}
