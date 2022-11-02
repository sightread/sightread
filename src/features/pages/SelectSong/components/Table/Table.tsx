import * as React from 'react'
import { useState } from 'react'
import { breakpoints } from '@/utils'
import { useWindowWidth } from '@/hooks'
import { TableProps, Row, RowValue } from './types'
import { sortBy } from './utils'
import { TableHead } from './TableHead'

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
  const sorted = sortBy<T>((row) => row[sortField] ?? 0, sortCol < 0, filtered)

  return (
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
        {sorted.length === 0 && <h2 className="text-2xl p-5">No results</h2>}
        {sorted.map((row: T, i) => {
          return (
            <div
              className="cursor-pointer contents group"
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
                    className="relative px-3 text-sm flex items-center flex-shrink-0 group-hover:bg-purple-hover group-even:bg-gray-100"
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
  )
}
