import { Row } from './types'
import { ExpandDownIcon } from '@/icons'

export function compare(a: number | string, b: number | string) {
  if (typeof a === 'string') {
    return a.localeCompare(b + '')
  }
  return +a - +b
}

export function sortBy<T extends Row>(fn: (x: T) => number | string, rev: boolean, arr: T[]): T[] {
  return arr.sort((a: T, b: T) => {
    return (rev ? -1 : 1) * compare(fn(a), fn(b))
  })
}

export function getIcon(sortCol: number, index: number) {
  const style: React.CSSProperties = { fill: '#1B0EA6', marginLeft: 5 }
  if (Math.abs(sortCol) === index + 1) {
    if (sortCol < 0) {
      style.transform = 'rotate(180deg)'
    }
    return <ExpandDownIcon width={15} height={15} style={style} />
  }
  return <></>
}
