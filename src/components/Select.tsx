'use client'

import { useWhenClickedOutside } from '@/hooks'
import { ChevronDown, Loader } from '@/icons'
import clsx from 'clsx'
import * as React from 'react'
import { useRef, useState, useEffect, useCallback } from 'react'

type SelectProps = {
  value: any
  options: any[]
  onChange: (value: any) => void
  format?: (value: string) => string | undefined
  display?: (value: string) => string | number | undefined
  loading?: boolean
  error?: boolean
  className?: string
  DEBOUNCE_TIMEOUT?: number
}

export default function Select({
  value,
  options,
  onChange,
  loading,
  error,
  className,
  format = (value) => value,
  display = (value) => value,
  DEBOUNCE_TIMEOUT = 2000,
}: SelectProps) {
  const [openMenu, setOpenMenu] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [, setSearchTerm] = useState('')
  const [sortedOptions, setSortedOptions] = useState(options);
  const menuRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const optionRefs = useRef<(HTMLDivElement | null)[]>([])
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

  const toggleMenu = () => {
    setOpenMenu(!openMenu)
  }

  const handleSelect = (val: any) => {
    onChange(val)
    toggleMenu()
    setHighlightedIndex(-1)
    setSearchTerm('')

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % sortedOptions.length
        scrollToOption(newIndex)
        return newIndex
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prevIndex) => {
        const newIndex = (prevIndex - 1 + sortedOptions.length) % sortedOptions.length
        scrollToOption(newIndex)
        return newIndex
      })
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && highlightedIndex < sortedOptions.length) {
        handleSelect(sortedOptions[highlightedIndex])
      }
    } else if (e.key === 'Escape') {
      setOpenMenu(false)
    } else {
      setSearchTerm((prevTerm) => {
        const newTerm = prevTerm + e.key.toLowerCase()
        const foundIndex = sortedOptions.findIndex(option =>
          format(option)?.toLowerCase()?.startsWith(newTerm)
        )
        if (foundIndex !== -1) {
          setHighlightedIndex(foundIndex)
          scrollToOption(foundIndex)
        }
        return newTerm
      })

      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }

      debounceTimeout.current = setTimeout(() => {
        setSearchTerm('')
      }, DEBOUNCE_TIMEOUT)
    }
  }

  const scrollToOption = (index: number) => {
    if (optionRefs?.current[index]) {
      optionRefs?.current[index]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }

  useEffect(() => {
    if (openMenu && inputRef.current) {
      inputRef.current.focus()
    }

    if (!openMenu) {
      setSearchTerm('')
    }
  }, [openMenu])

  useEffect(() => {
    setSortedOptions(sortOptions(options));
  }, [options])

  const sortOptions = useCallback((options: any) => ([...options].sort((a, b) => (format(a) ?? '').localeCompare(format(b) ?? ''))), [format]);


  useWhenClickedOutside(() => setOpenMenu(false), menuRef)

  return (
    <div
      className={clsx(
        className,
        'relative inline-block w-full text-black',
        error && 'border border-red-600',
      )}
    >
      <input
        ref={inputRef}
        value={!loading ? display(value) : ''}
        type="text"
        className={clsx(
          'max-h-full w-full cursor-pointer rounded-md border border-gray-200 p-2',
          'hover:border hover:border-purple-primary focus:border-purple-primary focus:outline-none',
        )}
        onClick={(e) => {
          e.stopPropagation()
          toggleMenu()
        }}
        onKeyDown={handleKeyDown}
        readOnly
        role="combobox"
        aria-expanded={openMenu}
        aria-haspopup="listbox"
        aria-controls="options-listbox"
        aria-activedescendant={highlightedIndex >= 0 ? `option-${highlightedIndex}` : undefined}
      />
      <ChevronDown
        width={15}
        height={15}
        className={clsx(
          'absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer transition',
          openMenu && 'rotate-180',
        )}
        onClick={(e) => {
          e.stopPropagation()
          toggleMenu()
        }}
      />
      {loading && (
        <div className="pointer-events-none absolute top-0 grid h-full w-full place-items-center">
          <Loader size={24} height={24} className="animate-spin text-purple-primary" />
        </div>
      )}
      <div className="relative">
        <div className="absolute top-0 z-10 w-full">
          <div
            ref={menuRef}
            className={clsx(
              'h-full max-h-[250px] w-full overflow-y-auto rounded-md border border-purple-primary bg-white transition',
              openMenu ? '' : 'hidden',
            )}
            role="listbox"
            id="options-listbox"
          >
            {sortedOptions.map((option, index) => {
              return (
                <div
                  key={option}
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  className={clsx(
                    'cursor-pointer p-1 hover:bg-purple-light',
                    highlightedIndex === index && 'bg-purple-light'
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelect(option)
                  }}
                  role="option"
                  id={`option-${index}`}
                  aria-selected={highlightedIndex === index}
                >
                  {format(option)}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
