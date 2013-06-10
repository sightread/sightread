import { IconInput } from './types'

export default function WarningIcon({ width, height, style, className, onClick }: IconInput) {
  return (
    <svg
      width={width}
      height={height}
      style={style}
      className={className}
      onClick={onClick}
      viewBox="0 0 42 41"
      fill="none"
    >
      <path
        d="M21 0C9.40134 0 0 9.1775 0 20.5C0 31.8225 9.40134 41 21 41C32.5987 41 42 31.8225 42 20.5C42 9.1775 32.5987 0 21 0ZM21 35.1429C12.7134 35.1429 6 28.5879 6 20.5C6 12.4107 12.7134 5.85714 21 5.85714C29.2852 5.85714 36 12.4107 36 20.5C36 28.5879 29.2852 35.1429 21 35.1429ZM18 32.2143H24V26.3571H18V32.2143ZM18 23.4286H24V8.78571H18V23.4286Z"
        fill="black"
      />
    </svg>
  )
}
