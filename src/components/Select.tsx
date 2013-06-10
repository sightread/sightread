import * as React from 'react'
import { useState, useRef } from 'react'
import { ArrowDown, LoadingIcon } from '@/icons'
import clsx from 'clsx'
import { useWhenClickedOutside } from '@/hooks'

type SelectProps = {
  value: any
  options: any[]
  onChange: (value: any) => void
  format?: (value: any) => any
  display?: (value: any) => string | number
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
  const [selected, setSelected] = useState<any>(value)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const toggleMenu = () => {
    setOpenMenu(!openMenu)
  }

  const handleSelect = (val: any) => {
    setSelected(val)
    onChange(val)
    toggleMenu()
  }

  useWhenClickedOutside(() => setOpenMenu(false), menuRef)

  return (
    <div
      className={clsx(className, 'relative inline-block w-full', error && 'border border-red-600')}
    >
      <input
        value={!loading ? display(selected) : ''}
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
      <ArrowDown
        width={15}
        height={15}
        className={clsx(
          'cursor-pointer absolute right-1 top-1/2 -translate-y-1/2 transition',
          openMenu && 'rotate-180',
        )}
        style={{ transform: 'translateY(-50%)' }}
        onClick={(e) => {
          e.stopPropagation()
          toggleMenu()
        }}
      />
      {loading && (
        <LoadingIcon width={15} height={15} className="absolute top-1 left-1 animate-spin" />
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
