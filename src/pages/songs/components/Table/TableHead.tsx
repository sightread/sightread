import { ChevronDown } from '@/icons'
import clsx from 'clsx'
import { TableHeadProps } from './types'

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
              'sticky top-0 z-10 flex items-center bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500',
              `h-[${rowHeight}px]`,
            )}
            key={`col-${col.id.toString()}`}
          >
            <span
              className={clsx(
                'flex cursor-pointer items-center gap-1',
                i === 0 && 'ml-5',
                col.id === 'duration' && 'ml-auto pr-5',
              )}
              onClick={() => onSelectCol(i + 1)}
            >
              {col.label}
              {isActive && (
                <ChevronDown
                  className={clsx('relative top-[1px] h-4 w-4', sortCol < 0 && 'rotate-180')}
                />
              )}
            </span>
          </div>
        )
      })}
    </>
  )
}
