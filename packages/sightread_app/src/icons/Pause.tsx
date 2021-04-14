import { IconInput } from './types'

export default function Pause({ width, height, className, onClick, style }: IconInput) {
  return (
    <svg
      style={style}
      onClick={onClick}
      height={height}
      width={width}
      className={className}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 38h8V10h-8v28zm16-28v28h8V10h-8z" />
      <path d="M0 0h48v48H0z" fill="none" />
    </svg>
  )
}
