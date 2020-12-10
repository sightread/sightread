import * as React from 'react'
import { useState } from 'react'
import { Sizer } from '../utils'
import { MusicFile } from '../../scripts/songdata'

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
}

type TableHeadProps = {
  columns: TableColumn[]
  sortCol: number
  onSelectCol: (index: number) => void
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

function SelectSongTable({ columns, rows, onSelectRow, filter }: SelectSongTableProps) {
  const [search, saveSearch] = useState('')
  const [sortCol, setSortCol] = useState<number>(1)

  const cols = columns.map((c) => c.id)
  const colWidth = (100 / cols.length).toFixed(2)

  const handleSelectCol = (index: number) => {
    if (sortCol === index) {
      setSortCol(-index)
    } else {
      setSortCol(index)
    }
  }

  const isSearchMatch = (s: string) => s.toUpperCase().includes(search.toUpperCase())
  const filtered =
    search === '' ? rows : rows.filter((row) => filter.some((f) => isSearchMatch(row[f])))
  const sortField = cols[Math.abs(sortCol) - 1]
  const sorted = sortBy((row) => row[sortField], sortCol < 0, filtered)

  return (
    <>
      <Sizer height={36} />
      <SearchBox onSearch={saveSearch} />
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
        <TableHead columns={columns} sortCol={sortCol} onSelectCol={handleSelectCol} />
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

function tableColumnClass(sortCol: number, index: number) {
  let className = ''
  if (Math.abs(sortCol) === index + 1) {
    className += 'activeSortHeader'
    if (sortCol < 0) {
      className += ' up'
    }
  }
  return className
}

function TableHead({ columns, sortCol, onSelectCol }: TableHeadProps) {
  const colWidth = (100 / columns.length).toFixed(2)
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
        const className = tableColumnClass(sortCol, i)
        const paddingLeft = i === 0 ? 30 : 0
        return (
          <div style={{ paddingLeft, width: `${colWidth}%`, ...col.style }} key={col.id}>
            <span onClick={() => onSelectCol(i + 1)} className={className}>
              {col.label}
            </span>
          </div>
        )
      })}
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
      <i
        className="fa fa-search"
        style={{
          fontSize: 16,
          position: 'absolute',
          left: 10,
          width: 16,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />
    </div>
  )
}
