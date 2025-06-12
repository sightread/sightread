export type TableColumn<T, D extends keyof T = never> = {
  label: string
  id: D
  keep?: boolean
  format?: (value: T[D]) => string | React.ReactNode
  sort?: (a: T[D], b: T[D]) => -1 | 0 | 1
}

export type RowValue = string | number | undefined | React.ReactNode
export type Row = { [key: string]: RowValue }

export type TableProps<T extends Row> = {
  columns: TableColumn<T, keyof T>[]
  rows: T[]
  search?: string | null
  onSelectRow: (id: string) => void
  filter: (keyof T)[]
  getId: (row: T) => string
}

export type TableHeadProps<T, D extends keyof T> = {
  columns: TableColumn<T, D>[]
  sortCol: number
  onSelectCol: (index: number) => void
  rowHeight: number
}
