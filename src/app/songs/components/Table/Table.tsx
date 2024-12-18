'use client'

import { useWindowWidth } from '@/hooks'
import { breakpoints } from '@/utils'
import { Star } from '@/icons'
import * as React from 'react'
import { useState } from 'react'
import { TableHead } from './TableHead'
import { Row, RowValue, TableProps } from './types'
import { sortBy } from './utils'
import clsx from 'clsx'

export default function Table<T extends Row>({
  columns,
  rows,
  search,
  onSelectRow,
  filter,
  getId,
  pinned,
  onPin
}: TableProps<T>) {
  const [sortCol, setSortCol] = useState(1)
  const isSmall = useWindowWidth() < breakpoints.sm
  let rowHeight = 50

  if (isSmall) {
    columns = columns.filter((c) => c.keep)
  }

  const headColumns = [...columns];

  if (onPin) {
    headColumns.push({label:"", id:"_pin"});
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
  const sorted = [
    ...sortBy<T>((row) => row[sortField] ?? 0, sortCol < 0, filtered.filter(row => pinned && pinned.has(getId(row)))),
    ...sortBy<T>((row) => row[sortField] ?? 0, sortCol < 0, filtered.filter(row => !pinned || !pinned.has(getId(row)))),
  ];

  const gridTemplateColumns = onPin ? `repeat(${headColumns.length - 1}, 1fr) 26px`: `repeat(${headColumns.length}, 1fr)`

  return (
    <>
      <div className="grid" style={{ gridTemplateColumns }}>
        <TableHead
          columns={headColumns}
          sortCol={sortCol}
          onSelectCol={handleSelectCol}
          rowHeight={rowHeight}
        />
      </div>
      <div className="relative flex flex-grow">
        <div
          className="absolute grid h-full w-full overflow-y-scroll rounded-md bg-white shadow-md"
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
                      className={clsx("relative flex flex-shrink-0 items-center px-3 text-sm group-hover:bg-purple-hover", pinned && pinned.has(getId(row)) ? "group-odd:bg-yellow-100 group-even:bg-yellow-200" : "group-even:bg-gray-100")}
                      key={`row-${i}-col-${j}`}
                      style={{ paddingLeft, height: rowHeight }}
                    >
                      {cellValue}
                    </span>
                  )
                })}
                { onPin && <button
                 className={clsx("relative items-center group-hover:bg-purple-hover", pinned && pinned.has(getId(row)) ? "group-odd:bg-yellow-100 group-even:bg-yellow-200" : "group-even:bg-gray-100")}
                  style={{ paddingLeft:0, height: rowHeight }}
                  onClick={(e) => {
                  e.stopPropagation();
                  onPin(getId(row))}}>
                    <Star size={24} className={clsx("hover:fill-yellow-100", pinned && pinned.has(getId(row)) && "fill-purple-primary")} />
                 </button>
                }
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
