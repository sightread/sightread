import { IconInput } from './types'

export default function ProgressIcon({ width, height, style, className, onClick }: IconInput) {
  return (
    <svg
      width={width}
      height={height}
      style={style}
      className={className}
      onClick={onClick}
      viewBox="0 0 46 38"
      fill="none"
    >
      <path d="M6 30H0V38H6V30Z" fill="#4912D4" />
      <path d="M16 23H10V38H16V23Z" fill="#4912D4" />
      <path d="M26 16H20V38H26V16Z" fill="#4912D4" />
      <path d="M36 8H30V38H36V8Z" fill="#4912D4" />
      <path d="M46 0H40V38H46V0Z" fill="#4912D4" />
    </svg>
  )
}
