import * as React from 'react'
import { css } from '@sightread/flake'
import { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowDown, LoadingIcon } from 'src/icons'
import clsx from 'clsx'

const classes = css({
  root: {
    position: 'relative',
    display: 'inline-block',
    width: '100%',
  },
  rootError: {
    border: '1px solid red',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid lightgrey',
    borderRadius: '4px',
    padding: '5px 20px 5px 5px',
    '&:hover': {
      cursor: 'pointer',
      border: '1px solid #7029FB',
    },
    '&:focus': {
      border: '1px solid #7029FB',
      outline: 'none',
    },
    zIndex: 1,
  },
  inputError: {
    color: 'red',
  },
  arrowIcon: {
    cursor: 'pointer',
    position: 'absolute',
    right: 5,
    top: '30%',
    zIndex: 0,
    userSelect: 'none',
    transition: '150ms',
  },
  arrowRotated: {
    transform: 'rotate(180deg)',
  },
  menuRoot: {
    transition: '150ms',
    maxHeight: '250px',
    overflowY: 'auto',
    border: '1px solid #7029FB',
    borderRadius: 5,
  },
  menuOpen: {
    height: '100%',
    backgroundColor: 'white',
  },
  menuClosed: {
    display: 'none',
  },
  option: {
    padding: 5,
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: '#d9d5ec',
    },
  },
  loading: {
    position: 'absolute',
    top: 5,
    left: 5,
    animation: 'spinner 2s infinite linear',
  },
})

type SelectProps = {
  value: any
  options: any[]
  onChange: (value: any) => void
  format?: (value: any) => any
  display?: (value: any) => string | number
  loading?: boolean
  error?: boolean
  classNames?: {
    select?: string
    option?: string
    menu?: string
    icon?: string
  }
}

export default function Select({
  value,
  options,
  onChange,
  loading,
  error,
  classNames,
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
  const handleClickAway = useCallback(
    (e: MouseEvent) => {
      if (!openMenu) {
        return
      }
      if (e.target !== menuRef.current) {
        setOpenMenu(false)
      }
    },
    [setOpenMenu, openMenu],
  )

  useEffect(() => {
    window.addEventListener('click', handleClickAway)
    return () => {
      window.removeEventListener('click', handleClickAway)
    }
  }, [handleClickAway])

  return (
    <div className={clsx(classes.root, { [classes.rootError]: error }, classNames?.select)}>
      <input
        value={!loading ? display(selected) : ''}
        type="text"
        className={clsx(classes.input, classNames?.select)}
        onClick={toggleMenu}
        readOnly
      />
      <ArrowDown
        width={15}
        height={15}
        className={clsx(classes.arrowIcon, { [classes.arrowRotated]: openMenu }, classNames?.icon)}
        onClick={toggleMenu}
      />
      {loading && (
        <LoadingIcon width={15} height={15} className={clsx(classes.loading, classNames?.icon)} />
      )}
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, width: '100%' }}>
          <div
            ref={menuRef}
            style={{ width: '100%' }}
            className={clsx(
              classes.menuRoot,
              classNames?.menu,
              openMenu ? classes.menuOpen : classes.menuClosed,
            )}
          >
            {options.map((option) => {
              return (
                <div
                  key={option}
                  className={`${classes.option} ${classNames?.option}`}
                  onClick={() => handleSelect(option)}
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
