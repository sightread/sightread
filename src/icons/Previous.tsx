import { IconInput } from './types'

export default function Previous({ width, height, style, className, onClick }: IconInput) {
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
      <path d="M12 12h4v24h-4zm7 12l17 12V12z" />
      <path d="M0 0h48v48H0z" fill="none" />
    </svg>
  )
}
