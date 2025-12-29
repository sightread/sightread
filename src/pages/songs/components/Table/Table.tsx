import { useWindowWidth } from '@/hooks'
import { breakpoints } from '@/utils'
import clsx from 'clsx'
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
  let rowHeight = 36

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
    <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="grid bg-gray-50" style={{ gridTemplateColumns }}>
        <TableHead
          columns={columns}
          sortCol={sortCol}
          onSelectCol={handleSelectCol}
          rowHeight={rowHeight}
        />
      </div>
      <div className="relative flex min-h-64 flex-1">
        <div
          className="absolute inset-0 grid content-start overflow-y-auto"
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
                  const isDuration = col.id === 'duration'
                  return (
                    <span
                      className={clsx(
                        'relative flex shrink-0 items-center px-3 text-sm',
                        'group-even:bg-gray-100 group-hover:bg-violet-50',
                        isDuration && 'justify-end font-mono text-gray-500',
                      )}
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
      <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500">
        <span>Showing {sorted.length} songs</span>
      </div>
    </div>
  )
}
