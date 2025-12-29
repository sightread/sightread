import { TextInput } from '@/components/TextInput'
import { Search } from '@/icons'

export type SearchBoxProps = {
  onSearch: (val: string) => void
  placeholder: string
  autoFocus?: boolean
}

export function SearchBox({ onSearch, placeholder, autoFocus }: SearchBoxProps) {
  return (
    <div className="relative h-9 w-full">
      <TextInput
        type="search"
        onChange={(e: any) => onSearch(e.target.value)}
        className="absolute h-full w-full rounded-md border border-gray-200 bg-white pl-9 pr-3 text-sm placeholder:font-mono placeholder:text-gray-500"
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
      <Search size={18} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
    </div>
  )
}
