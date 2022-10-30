import { Row } from './types'

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
