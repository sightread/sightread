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
              'sticky top-0 z-10 flex items-center bg-violet-900 text-white',
              `h-[${rowHeight}px]`,
            )}
            key={`col-${col.id.toString()}`}
          >
            <span
              className={clsx('flex cursor-pointer items-center gap-1', i === 0 && 'ml-5')}
              onClick={() => onSelectCol(i + 1)}
            >
              {col.label}
              {isActive && (
                <ChevronDown className={clsx('relative top-[1px]', sortCol < 0 && 'rotate-180')} />
              )}
            </span>
          </div>
        )
      })}
    </>
  )
}
