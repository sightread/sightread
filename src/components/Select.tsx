'use client'

import { useWhenClickedOutside } from '@/hooks'
import { ChevronDown, Loader } from '@/icons'
import clsx from 'clsx'
import * as React from 'react'
import { useRef, useState } from 'react'

type SelectProps = {
  value: any
  options: any[]
  onChange: (value: any) => void
  format?: (value: string) => string | undefined
  display?: (value: string) => string | number | undefined
  loading?: boolean
  error?: boolean
  className?: string
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
}: SelectProps) {
  const [openMenu, setOpenMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const toggleMenu = () => {
    setOpenMenu(!openMenu)
  }

  const handleSelect = (val: any) => {
    onChange(val)
    toggleMenu()
  }

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
        readOnly
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
          >
            {options.map((option) => {
              return (
                <div
                  key={option}
                  className={clsx('cursor-pointer p-1 hover:bg-purple-light')}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelect(option)
                  }}
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
