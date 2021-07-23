import { MouseEvent } from 'react'

export type IconInput = {
  width: number | string
  height: number | string
  style?: React.CSSProperties
  className?: string
  onClick?: (event: MouseEvent<SVGElement>) => void
}
