import { ComboBox, ComboBoxItem } from '@/components/ComboBox'
import { gmInstruments, InstrumentName } from '@/features/synth'
import { formatInstrumentName } from '@/utils'
import clsx from 'clsx'
import React, { useEffect, useMemo, useRef, useState } from 'react'

type PickInstrumentProps = {
  value: InstrumentName
  onChange: (instrument: InstrumentName) => void
  isLoading?: boolean
  errorMessage?: string
  isDisabled?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const comboFieldStyles = {
  sm: 'h-7 rounded-md border border-zinc-700 bg-zinc-900/70 transition hover:bg-white/10 cursor-default outline-0 outline-offset-0 focus-within:outline-0 focus-visible:outline-0',
  md: 'h-8 rounded-md border border-zinc-700 bg-zinc-900/70 transition hover:bg-white/10 cursor-default outline-0 outline-offset-0 focus-within:outline-0 focus-visible:outline-0',
  lg: 'h-9 rounded-md border border-zinc-700 bg-zinc-900/70 transition hover:bg-white/10 cursor-default outline-0 outline-offset-0 focus-within:outline-0 focus-visible:outline-0',
}

const comboInputStyles = {
  sm: 'min-w-0 flex-1 bg-transparent px-2 py-0 text-[11px] font-medium text-zinc-200 outline-none cursor-default focus:cursor-text',
  md: 'min-w-0 flex-1 bg-transparent px-2.5 py-0 text-sm font-medium text-zinc-200 outline-none cursor-default focus:cursor-text',
  lg: 'min-w-0 flex-1 bg-transparent px-2.5 py-0 text-sm font-medium text-zinc-200 outline-none cursor-default focus:cursor-text',
}

export function PickInstrument({
  value,
  onChange,
  isLoading,
  errorMessage,
  isDisabled,
  className,
  size = 'md',
}: PickInstrumentProps) {
  const label = formatInstrumentName(value)
  const [inputValue, setInputValue] = useState(label)
  const lastSelectedRef = useRef<InstrumentName | null>(null)
  const items = useMemo(
    () =>
      gmInstruments.map((instrument) => ({
        id: instrument,
        name: formatInstrumentName(instrument),
      })),
    [],
  )

  useEffect(() => {
    setInputValue(label)
    if (lastSelectedRef.current === value) {
      lastSelectedRef.current = null
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
    }
  }, [label])

  return (
    <ComboBox
      className={className}
      isLoading={isLoading}
      errorMessage={errorMessage}
      isDisabled={isDisabled}
      fieldGroupClassName={clsx(comboFieldStyles[size], className)}
      inputClassName={comboInputStyles[size]}
      buttonClassName="text-zinc-400 group-hover:text-zinc-200 transition-colors"
      selectedKey={value}
      inputValue={inputValue}
      onInputChange={setInputValue}
      onFocus={() => {
        if (inputValue === label) {
          setInputValue('')
        }
      }}
      onSelectionChange={(key) => {
        const nextKey = key as InstrumentName
        lastSelectedRef.current = nextKey
        onChange(nextKey)
        const nextLabel =
          items.find((item) => item.id === key)?.name ?? formatInstrumentName(nextKey)
        setInputValue(nextLabel)
      }}
      items={items}
      aria-label="Select instrument"
    >
      {(item) => <ComboBoxItem>{item.name}</ComboBoxItem>}
    </ComboBox>
  )
}
