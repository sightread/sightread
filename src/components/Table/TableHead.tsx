import { TableHeadProps } from './types'
import { getIcon } from './utils'

const headerStyles: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 2,
  display: 'flex',
  alignItems: 'center',
  fontWeight: 600,
  color: '#1B0EA6',
  backgroundColor: '#F1F1F1',
  borderBottom: '#d9d5ec solid 1px',
}

export function TableHead<T, D extends keyof T>({
  columns,
  sortCol,
  onSelectCol,
  rowHeight,
}: TableHeadProps<T, D>) {
  return (
    <>
      {columns.map((col, i) => {
        const marginLeft = i === 0 ? 20 : 0
        return (
          <div style={{ ...headerStyles, height: rowHeight }} key={`col-${col.id.toString()}`}>
            <span style={{ cursor: 'pointer', marginLeft }} onClick={() => onSelectCol(i + 1)}>
              {col.label}
              {getIcon(sortCol, i)}
            </span>
          </div>
        )
      })}
    </>
  )
}
