import clsx from 'clsx'
import { TableHeadProps } from './types'
import { ChevronDown } from '@/icons'

export function TableHead<T, D extends keyof T>({
  columns,
  sortCol,
  onSelectCol,
  rowHeight,
}: TableHeadProps<T, D>) {
  return (
    <>
      {columns.map((col, i) => {
        const isActive = Math.abs(sortCol) === i + 1
        return (
          <div
            className={clsx(
              'select-none',
              'z-10 top-0 sticky flex items-center text-white bg-purple-darkest',
              `h-[${rowHeight}px]`,
            )}
            key={`col-${col.id.toString()}`}
          >
            <span
              className={clsx('flex items-center cursor-pointer gap-2', i === 0 && 'ml-5')}
              onClick={() => onSelectCol(i + 1)}
            >
              {col.label}
              {isActive && <ChevronDown className={clsx(sortCol < 0 && 'rotate-180')} />}
            </span>
          </div>
        )
      })}
    </>
  )
}
