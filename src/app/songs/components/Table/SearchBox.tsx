import { Search } from '@/icons'
import { TextInput } from '@/components/TextInput'

export type SearchBoxProps = { onSearch: (val: string) => void; placeholder: string }
export function SearchBox({ onSearch, placeholder }: SearchBoxProps) {
  return (
    <div className="relative w-80 h-[40px]">
      <TextInput
        type="search"
        onChange={(e: any) => onSearch(e.target.value)}
        className="absolute h-full w-full pl-10 rounded-md bg-gray-100 placeholder:text-base placeholder-gray-700"
        placeholder={placeholder}
      />
      <Search
        size={20}
        className="absolute left-3 top-1/2 -translate-y-1/2"
        style={{ transform: 'translateY(-50%)' }}
      />
    </div>
  )
}
