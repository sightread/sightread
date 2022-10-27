import { SearchIcon } from '@/icons'
import clsx from 'clsx'

export type SearchBoxProps = { onSearch: (val: string) => void; placeholder: string }
export function SearchBox({ onSearch, placeholder }: SearchBoxProps) {
  return (
    <div className="relative h-8 w-80">
      <input
        type="search"
        onChange={(e: any) => onSearch(e.target.value)}
        className={clsx(
          'absolute h-full w-full pl-10 rounded-md',
          'shadow-[inset_0px_1px_4px_rgba(0,0,0,0.25)]',
        )}
        placeholder={placeholder}
      />
      <SearchIcon height={25} width={25} className="absolute left-2 top-1/2 -translate-y-1/2" />
    </div>
  )
}
