export type TableColumn<T, D extends keyof T = never> = {
  label: string
  id: D
  keep?: boolean
  format?: (value: T[D]) => string | React.ReactNode
}

export type RowValue = string | number | undefined
export type Row = { [key: string]: RowValue }

export type TableProps<T extends Row> = {
  columns: TableColumn<T, keyof T>[]
  rows: T[]
  searchBoxPlaceholder: string
  onSelectRow: (row: T) => void
  filter: (keyof T)[]
  onCreate?: () => void
  onDelete?: null | ((item: T | undefined) => void)
  onFilter?: () => void
}

export type TableHeadProps<T, D extends keyof T> = {
  columns: TableColumn<T, D>[]
  sortCol: number
  onSelectCol: (index: number) => void
  rowHeight: number
}

export type SearchBoxProps = { onSearch: (val: string) => void; placeholder: string }
