import * as React from 'react'
import { useState } from 'react'
import { breakpoints, Sizer } from '../utils'
import {
  SearchIcon,
  ExpandDownIcon,
  PlusIcon,
  TrashCanIcon,
  IconWrapper,
  FilterIcon,
} from '../icons'
import { css } from '@sightread/flake'
import { palette } from '../styles/common'
import { useWindowWidth } from 'src/hooks'

type TableColumn<T, D extends keyof T = never> = {
  label: string
  id: D
  keep?: boolean
  format?: (value: T[D]) => string | React.ReactNode
}

type RowValue = string | number | undefined
type Row = { [key: string]: RowValue }

type SelectSongTableProps<T extends Row> = {
  columns: TableColumn<T, keyof T>[]
  rows: T[]
  onSelectRow: (row: T) => void
  filter: (keyof T)[]
  onCreate?: () => void
  onDelete?: (item: T | undefined) => void | null
  onFilter?: () => void
}

type TableHeadProps<T, D extends keyof T> = {
  columns: TableColumn<T, D>[]
  sortCol: number
  onSelectCol: (index: number) => void
  rowHeight: number
}

function compare(a: number | string, b: number | string) {
  if (typeof a === 'string') {
    return a.localeCompare(b + '')
  }
  return +a - +b
}

function sortBy<T extends Row>(fn: (x: T) => number | string, rev: boolean, arr: T[]): T[] {
  return arr.sort((a: T, b: T) => {
    return (rev ? -1 : 1) * compare(fn(a), fn(b))
  })
}

const classes = css({
  expandIcon: {
    fill: '#1B0EA6',
  },
  button: {
    background: palette.purple.primary,
    color: 'white',
    display: 'flex',
    borderRadius: '5px',
    alignItems: 'center',
    fontSize: '16px',
    width: '150px',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: '200ms',
    border: 'none',
    padding: 5,
    '&:hover': {
      backgroundColor: palette.purple.dark,
    },
  },
  actionButton: {
    '&:hover': {
      backgroundColor: 'white !important',
    },
  },
  tableRow: {
    '&:hover > *': {
      backgroundColor: 'rgb(159 133 221 / 45%)',
    },
    cursor: 'pointer',
  },
  filterButton: {
    marginLeft: '24px',
    cursor: 'pointer',
    '&:hover svg': {
      fill: 'white',
    },
    '&:hover': {
      backgroundColor: palette.purple.primary,
    },
  },
})

function SelectSongTable<T extends Row>({
  columns,
  rows,
  onSelectRow,
  filter,
  onCreate,
  onDelete,
  onFilter,
}: SelectSongTableProps<T>) {
  const [search, saveSearch] = useState('')
  const [sortCol, setSortCol] = useState(1)
  const isSmall = useWindowWidth() < breakpoints.sm
  let rowHeight = 40

  if (isSmall) {
    columns = columns.filter((c) => c.keep)
    rowHeight = 50
  }

  const handleSelectCol = (index: number) => {
    if (sortCol === index) {
      setSortCol(-index)
    } else {
      setSortCol(index)
    }
  }

  const isSearchMatch = (s: RowValue = '') => String(s).toUpperCase().includes(search.toUpperCase())
  const filtered = !search ? rows : rows.filter((row) => filter.some((f) => isSearchMatch(row[f])))
  const sortField = columns[Math.abs(sortCol) - 1].id
  const sorted = sortBy<T>((row) => row[sortField] ?? 0, sortCol < 0, filtered)

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <SearchBox onSearch={saveSearch} />
          {!!onFilter && (
            <IconWrapper onClick={onFilter} className={classes.filterButton}>
              <FilterIcon height={30} width={30} />
            </IconWrapper>
          )}
        </div>
        {!!onCreate && (
          <button type="button" className={classes.button} onClick={onCreate}>
            <PlusIcon width={20} height={20} style={{ fill: 'white', margin: '5px' }} />
            <span>Add New</span>
          </button>
        )}
      </div>
      <Sizer height={16} />
      <div style={{ position: 'relative', flexGrow: 1 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
            position: 'absolute',
            width: '100%',
            maxHeight: '100%',
            backgroundColor: '#FFF',
            boxShadow: `0px 0px 5px rgba(0, 0, 0, 0.2)`,
            borderRadius: 5,
            overflowY: 'scroll',
          }}
        >
          <TableHead
            columns={columns}
            sortCol={sortCol}
            onSelectCol={handleSelectCol}
            rowHeight={rowHeight}
          />
          {sorted.length === 0 && (
            <h2 style={{ fontSize: '24px', textAlign: 'center', paddingTop: '50px' }}>
              Nothing here yet.
            </h2>
          )}
          {sorted.map((row: T) => {
            return (
              <div
                className={classes.tableRow}
                style={{ display: 'contents' }}
                onClick={() => onSelectRow(row)}
              >
                {columns.map((col, i) => {
                  let cellValue = !!col.format ? col.format(row[col.id]) : row[col.id]
                  const paddingLeft = i === 0 ? 20 : 0
                  return (
                    <span
                      className={classes.tableRow}
                      style={{
                        position: 'relative',
                        boxSizing: 'border-box',
                        paddingLeft,
                        height: rowHeight,
                        fontSize: 14,
                        display: 'flex',
                        alignItems: 'center',
                        flexShrink: 0,
                        borderBottom: '#d9d5ec solid 1px',
                      }}
                      key={col.id as string}
                    >
                      {cellValue}
                    </span>
                  )
                })}
                {onDelete && (
                  <IconWrapper onClick={() => onDelete(row)} className={classes.actionButton}>
                    <TrashCanIcon width={20} height={20} style={{ fill: palette.purple.primary }} />
                  </IconWrapper>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

function getIcon(sortCol: number, index: number) {
  const style: React.CSSProperties = { fill: '#1B0EA6', marginLeft: 5 }
  if (Math.abs(sortCol) === index + 1) {
    if (sortCol < 0) {
      style.transform = 'rotate(180deg)'
    }
    return <ExpandDownIcon width={15} height={15} style={style} />
  }
  return <></>
}

function TableHead<T, D extends keyof T>({
  columns,
  sortCol,
  onSelectCol,
  rowHeight,
}: TableHeadProps<T, D>) {
  const headerStyles: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    height: rowHeight,
    boxSizing: 'border-box',
    fontWeight: 600,
    color: '#1B0EA6',
    backgroundColor: '#F1F1F1',
    borderBottom: '#d9d5ec solid 1px',
  }
  return (
    <>
      {columns.map((col, i) => {
        const marginLeft = i === 0 ? 20 : 0
        return (
          <div style={{ ...headerStyles }} key={col.id as string}>
            <span style={{ cursor: 'pointer', marginLeft }} onClick={() => onSelectCol(i + 1)}>
              {col.label}
              {getIcon(sortCol, i)}
            </span>
          </div>
        )
      })}
    </>
  )
}

function SearchBox({ onSearch }: { onSearch: (val: string) => void }) {
  return (
    <div style={{ position: 'relative', height: 32, width: 300 }}>
      <input
        type="search"
        onChange={(e: any) => onSearch(e.target.value)}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          paddingLeft: 40,
          backgroundColor: '#F9F9F9',
          borderRadius: '5px',
          boxShadow: 'inset 0px 1px 4px rgba(0, 0, 0, 0.25)',
          border: 'none',
        }}
        placeholder="Search Songs by Title or Artist"
      />
      <SearchIcon
        height={25}
        width={25}
        style={{
          position: 'absolute',
          left: 10,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />
    </div>
  )
}

export default SelectSongTable
