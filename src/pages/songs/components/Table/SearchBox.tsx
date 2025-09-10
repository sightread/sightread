import { TextInput } from '@/components/TextInput'
import { Search } from '@/icons'

export type SearchBoxProps = { onSearch: (val: string) => void; placeholder: string }
export function SearchBox({ onSearch, placeholder }: SearchBoxProps) {
  return (
    <div className="relative h-[40px] w-80">
      <TextInput
        type="search"
        onChange={(e: any) => onSearch(e.target.value)}
        className="absolute h-full w-full rounded-md bg-gray-100 pl-10 placeholder-gray-700 placeholder:text-base"
        placeholder={placeholder}
      />
      <Search size={20} className="absolute top-1/2 left-3 -translate-y-1/2" />
    </div>
  )
}
