import * as React from 'react'
import { useState, useRef } from 'react'
import { ChevronDown, Loader } from '@/icons'
import clsx from 'clsx'
import { useWhenClickedOutside } from '@/hooks'

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
          'max-h-full w-full border border-gray-200 rounded-md cursor-pointer p-2',
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
          'cursor-pointer absolute right-1 top-1/2 -translate-y-1/2 transition',
          openMenu && 'rotate-180',
        )}
        onClick={(e) => {
          e.stopPropagation()
          toggleMenu()
        }}
      />
      {loading && (
        <div className="absolute top-0 w-full h-full grid place-items-center pointer-events-none">
          <Loader size={24} height={24} className="animate-spin text-purple-primary" />
        </div>
      )}
      <div className="relative">
        <div className="absolute top-0 w-full z-10">
          <div
            ref={menuRef}
            className={clsx(
              'w-full h-full bg-white transition max-h-[250px] overflow-y-auto border border-purple-primary rounded-md',
              openMenu ? '' : 'hidden',
            )}
          >
            {options.map((option) => {
              return (
                <div
                  key={option}
                  className={clsx('p-1 cursor-pointer hover:bg-purple-light')}
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
