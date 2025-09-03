'use client'

import { useWindowWidth } from '@/hooks'
import { breakpoints } from '@/utils'
import * as React from 'react'
import { useState } from 'react'
import { TableHead } from './TableHead'
import { Row, RowValue, TableProps } from './types'
import { sortBy } from './utils'

export default function Table<T extends Row>({
  columns,
  rows,
  search,
  onSelectRow,
  filter,
  getId,
}: TableProps<T>) {
  const [sortCol, setSortCol] = useState(1)
  const isSmall = useWindowWidth() < breakpoints.sm
  let rowHeight = 50

  if (isSmall) {
    columns = columns.filter((c) => c.keep)
  }

  const handleSelectCol = (index: number) => {
    if (sortCol === index) {
      setSortCol(-index)
    } else {
      setSortCol(index)
    }
  }

  const isSearchMatch = (s: RowValue = '') =>
    !search || String(s).toUpperCase().includes(search.toUpperCase())
  const filtered = !search ? rows : rows.filter((row) => filter.some((f) => isSearchMatch(row[f])))
  const sortField = columns[Math.abs(sortCol) - 1].id
  const sorted = sortBy<T>(
    (row) => {
      let field = row[sortField]
      if (typeof field === 'string' || typeof field === 'number') {
        return field
      }
      return 0
    },
    sortCol < 0,
    filtered,
  )
  const gridTemplateColumns = `repeat(${columns.length}, 1fr)`

  return (
    <>
      <div className="grid" style={{ gridTemplateColumns }}>
        <TableHead
          columns={columns}
          sortCol={sortCol}
          onSelectCol={handleSelectCol}
          rowHeight={rowHeight}
        />
      </div>
      <div className="relative flex min-h-64 grow">
        <div
          className="absolute grid h-full w-full content-start overflow-y-scroll rounded-md bg-white shadow-md"
          style={{ gridTemplateColumns }}
        >
          {sorted.length === 0 && <h2 className="p-5 text-2xl">No results</h2>}
          {sorted.map((row: T, i) => {
            return (
              <div
                className="group contents cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectRow(getId(row))
                }}
                key={`row-${getId(row)}`}
              >
                {columns.map((col, j) => {
                  let cellValue = !!col.format ? col.format(row[col.id]) : row[col.id]
                  const paddingLeft = j === 0 ? 20 : 0
                  return (
                    <span
                      className="relative flex shrink-0 items-center px-3 text-sm group-even:bg-gray-100 group-hover:bg-violet-200"
                      key={`row-${i}-col-${j}`}
                      style={{ paddingLeft, height: rowHeight }}
                    >
                      {cellValue}
                    </span>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
