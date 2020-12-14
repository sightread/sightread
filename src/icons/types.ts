import { MouseEvent } from 'react'

export type IconInput = {
  width: number
  height: number
  style?: React.CSSProperties
  className?: string
  onClick?: (event: MouseEvent<SVGSVGElement>) => void
}
