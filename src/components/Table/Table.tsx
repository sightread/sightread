import * as React from 'react'
import { useState } from 'react'
import { breakpoints } from '@/utils'
import { Sizer } from '@/components'
import { PlusIcon, TrashCanIcon, IconWrapper, FilterIcon } from '@/icons'
import { css } from '@sightread/flake'
import { palette } from '@/styles/common'
import { useWindowWidth } from '@/hooks'
import { TableProps, Row, RowValue } from './types'
import { sortBy } from './utils'
import { SearchBox } from './SearchBox'
import { TableHead } from './TableHead'

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

export default function Table<T extends Row>({
  columns,
  rows,
  searchBoxPlaceholder,
  onSelectRow,
  filter,
  onCreate,
  onDelete,
  onFilter,
  getId,
}: TableProps<T>) {
  const [search, saveSearch] = useState('')
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

  const isSearchMatch = (s: RowValue = '') => String(s).toUpperCase().includes(search.toUpperCase())
  const filtered = !search ? rows : rows.filter((row) => filter.some((f) => isSearchMatch(row[f])))
  const sortField = columns[Math.abs(sortCol) - 1].id
  const sorted = sortBy<T>((row) => row[sortField] ?? 0, sortCol < 0, filtered)

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <SearchBox placeholder={searchBoxPlaceholder} onSearch={saveSearch} />
          {!!onFilter && !isSmall && (
            <IconWrapper onClick={onFilter} className={classes.filterButton}>
              <FilterIcon height={30} width={30} />
            </IconWrapper>
          )}
        </div>
        {!!onCreate && !isSmall && (
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
          {sorted.length === 0 && <h2 style={{ fontSize: '24px', padding: 20 }}>No results</h2>}
          {sorted.map((row: T, i) => {
            return (
              <div
                className={classes.tableRow}
                style={{ display: 'contents' }}
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
                      className={classes.tableRow}
                      key={`row-${i}-col-${j}`}
                      style={{
                        position: 'relative',
                        paddingLeft,
                        height: rowHeight,
                        fontSize: 14,
                        display: 'flex',
                        alignItems: 'center',
                        flexShrink: 0,
                        borderBottom: '#d9d5ec solid 1px',
                      }}
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
