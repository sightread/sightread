import * as React from 'react'
import { useState } from 'react'
import { Sizer } from '../utils'
import { MusicFile } from '../../scripts/songdata'
import {
  SearchIcon,
  ExpandDownIcon,
  PlusIcon,
  TrashCanIcon,
  IconWrapper,
  FilterIcon,
} from '../icons'
import { css } from '../flakecss'
import { palette } from '../styles/common'

type TableColumn = {
  label: string
  id: string
  style?: React.CSSProperties
  format?: (value: any) => string | React.ReactNode
}

type SelectSongTableProps = {
  columns: TableColumn[]
  rows: any[]
  onSelectRow: (row: any) => void
  filter: (keyof MusicFile)[]
  onCreate?: () => void
  onDelete?: (item: any | undefined) => void
  onFilter?: () => void
}

type TableHeadProps = {
  columns: TableColumn[]
  sortCol: number
  onSelectCol: (index: number) => void
  hasActionRow: boolean
}

function compare(a: number | string, b: number | string) {
  if (typeof a === 'string') {
    return a.localeCompare(b + '')
  }
  return +a - +b
}

function sortBy<T>(fn: (x: T) => number | string, rev: boolean, arr: T[]): T[] {
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
    '&:hover': {
      backgroundColor: palette.purple.dark,
    },
  },
  actionButton: {
    '&:hover': {
      backgroundColor: 'white !important',
    },
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

function SelectSongTable({
  columns,
  rows,
  onSelectRow,
  filter,
  onCreate,
  onDelete,
  onFilter,
}: SelectSongTableProps) {
  const [search, saveSearch] = useState('')
  const [sortCol, setSortCol] = useState<number>(1)

  const cols = columns.map((c) => c.id)
  const hasActionRow = !!onDelete
  const actionRow = hasActionRow ? 10 : 0 // action row will be 10% of width
  const colWidth = ((100 - actionRow) / cols.length).toFixed(2)

  const handleSelectCol = (index: number) => {
    if (sortCol === index) {
      setSortCol(-index)
    } else {
      setSortCol(index)
    }
  }

  const isSearchMatch = (s: string) => s.toUpperCase().includes(search.toUpperCase())
  const filtered = !search ? rows : rows.filter((row) => filter.some((f) => isSearchMatch(row[f])))
  const sortField = cols[Math.abs(sortCol) - 1]
  const sorted = sortBy((row) => row[sortField], sortCol < 0, filtered)

  return (
    <>
      <Sizer height={36} />
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
      <Sizer height={20} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          width: '100%',
          flexGrow: 1,
          backgroundColor: '#FFF',
          boxShadow: `0px 0px 5px rgba(0, 0, 0, 0.2)`,
          borderRadius: 5,
          overflow: 'hidden',
          contain: 'strict',
        }}
      >
        <TableHead
          columns={columns}
          sortCol={sortCol}
          onSelectCol={handleSelectCol}
          hasActionRow={hasActionRow}
        />
        <div
          style={{
            overflowY: 'auto',
            overflowX: 'hidden',
            position: 'absolute',
            top: 30,
            height: '100%',
            width: '100%',
          }}
        >
          {sorted.length === 0 && (
            <h2 style={{ fontSize: '24px', textAlign: 'center', paddingTop: '50px' }}>
              Nothing here yet.
            </h2>
          )}
          {sorted.map((row: any) => {
            return (
              <div
                onClick={() => onSelectRow(row)}
                style={{
                  position: 'relative',
                  boxSizing: 'border-box',
                  height: 35,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                  borderBottom: '#d9d5ec solid 1px',
                }}
                className="SelectSongPage__song"
                key={row.file}
              >
                {columns.map((col, i) => {
                  let cellValue = row[col.id]
                  if (!!col.format) {
                    cellValue = col.format(cellValue)
                  }
                  const paddingLeft = i === 0 ? 30 : 0
                  return (
                    <span style={{ paddingLeft, width: `${colWidth}%`, ...col.style }} key={col.id}>
                      {cellValue}
                    </span>
                  )
                })}
                {!!onDelete && (
                  <span style={{ width: '10%' }}>
                    <IconWrapper onClick={() => onDelete(row)} className={classes.actionButton}>
                      <TrashCanIcon
                        width={20}
                        height={20}
                        style={{ fill: palette.purple.primary }}
                      />
                    </IconWrapper>
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <Sizer height={60} />
    </>
  )
}

export default SelectSongTable

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

function TableHead({ columns, sortCol, onSelectCol, hasActionRow }: TableHeadProps) {
  const actionRow = hasActionRow ? 10 : 0 // actions buttons take up 10%
  const colWidth = ((100 - actionRow) / columns.length).toFixed(2)
  return (
    <div
      className="table_header"
      style={{
        position: 'sticky',
        top: 0,
        display: 'flex',
        alignItems: 'center',
        height: 30,
        boxSizing: 'border-box',
        fontWeight: 600,
        color: '#1B0EA6',
        backgroundColor: '#F1F1F1',
        flexShrink: 0,
        borderBottom: '#d9d5ec solid 1px',
        zIndex: 1,
      }}
    >
      {columns.map((col, i) => {
        const paddingLeft = i === 0 ? 30 : 0
        return (
          <div style={{ paddingLeft, width: `${colWidth}%`, ...col.style }} key={col.id}>
            <span
              onClick={() => onSelectCol(i + 1)}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              {col.label}
              {getIcon(sortCol, i)}
            </span>
          </div>
        )
      })}
      {hasActionRow && <div style={{ width: `10%`, height: '100%' }}></div>}
    </div>
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
