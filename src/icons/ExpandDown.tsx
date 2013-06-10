import { IconInput } from './types'

export default function CaretDown({ width, height, style, className, onClick }: IconInput) {
  return (
    <svg
      style={style}
      onClick={onClick}
      height={height}
      width={width}
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polyline fill="none" points="21,8.5 12,17.5 3,8.5 " strokeMiterlimit="10" strokeWidth="5" />
    </svg>
  )
}
