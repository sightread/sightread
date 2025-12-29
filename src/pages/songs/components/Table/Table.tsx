import { ChevronDown } from '@/icons'
import { SongMetadata } from '@/types'
import { formatTime } from '@/utils'
import clsx from 'clsx'
import * as React from 'react'
import { useMemo, useState } from 'react'
import { useCollator, useFilter } from 'react-aria'
import { Cell, Column, Table as RacTable, Row, TableBody, TableHeader } from 'react-aria-components'

type SongsTableProps = {
  rows: SongMetadata[]
  search: string
  onSelectRow: (id: string) => void
}

type SortState = {
  column: 'title' | 'duration'
  direction: 'ascending' | 'descending'
}

export default function Table({ rows, search, onSelectRow }: SongsTableProps) {
  const { contains } = useFilter({ sensitivity: 'base' })
  const collator = useCollator({ numeric: true, sensitivity: 'base' })
  const [sortDescriptor, setSortDescriptor] = useState<SortState>({
    column: 'title',
    direction: 'ascending',
  })

  const filtered = useMemo(() => {
    if (!search) return rows
    return rows.filter((row) => contains(row.title, search))
  }, [contains, rows, search])

  const sorted = useMemo(() => {
    const next = [...filtered]
    const { column, direction } = sortDescriptor
    next.sort((a, b) => {
      let cmp = 0
      if (column === 'duration') {
        cmp = a.duration - b.duration
      } else {
        cmp = collator.compare(a.title, b.title)
      }
      return direction === 'descending' ? -cmp : cmp
    })
    return next
  }, [collator, filtered, sortDescriptor])

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div>
        <RacTable
          aria-label="Songs"
          className="w-full table-fixed text-sm"
          sortDescriptor={sortDescriptor}
          onSortChange={(descriptor) =>
            setSortDescriptor({
              column: descriptor.column as SortState['column'],
              direction: descriptor.direction as SortState['direction'],
            })
          }
        >
          <TableHeader className="table w-full table-fixed bg-gray-50">
            <Column
              id="title"
              isRowHeader
              allowsSorting
              className="border-b border-gray-200 px-4 py-2 text-left text-sm font-semibold tracking-wider text-gray-500 uppercase"
            >
              {({ sortDirection }) => (
                <div className="flex items-center gap-1">
                  <span className="truncate">Title</span>
                  <span className="flex h-4 w-4 items-center justify-center">
                    {sortDirection && (
                      <ChevronDown
                        className={clsx(
                          'h-4 w-4',
                          sortDirection === 'descending' && 'rotate-180',
                        )}
                      />
                    )}
                  </span>
                </div>
              )}
            </Column>
            <Column
              id="duration"
              allowsSorting
              className="w-30 border-b border-gray-200 px-4 py-2 text-right text-sm font-semibold tracking-wider text-gray-500 uppercase"
            >
              {({ sortDirection }) => (
                <div className="flex items-center justify-end gap-1">
                  <span>Length</span>
                  <span className="flex h-4 w-4 items-center justify-center">
                    {sortDirection && (
                      <ChevronDown
                        className={clsx(
                          'h-4 w-4',
                          sortDirection === 'descending' && 'rotate-180',
                        )}
                      />
                    )}
                  </span>
                </div>
              )}
            </Column>
          </TableHeader>
          <TableBody
            className="block max-h-150 overflow-y-auto"
            items={sorted}
            renderEmptyState={() => <div className="p-5 text-2xl">No results</div>}
          >
            {(item) => (
              <Row
                id={item.id}
                className="table w-full table-fixed cursor-pointer text-gray-900 hover:bg-violet-50"
                onAction={() => onSelectRow(item.id)}
              >
                <Cell className="border-b border-gray-200 px-4 py-2">
                  <span className="block truncate whitespace-nowrap">{item.title}</span>
                </Cell>
                <Cell className="border-b border-gray-200 px-4 py-2 text-right font-mono text-gray-500">
                  {formatTime(Number(item.duration))}
                </Cell>
              </Row>
            )}
          </TableBody>
        </RacTable>
      </div>
      <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500">
        <span>Showing {sorted.length} songs</span>
      </div>
    </div>
  )
}
