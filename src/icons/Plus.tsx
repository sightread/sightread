import { IconInput } from './types'

export default function Plus({ width, height, style, className, onClick }: IconInput) {
  return (
    <svg
      style={style}
      onClick={onClick}
      height={height}
      width={width}
      className={className}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M28,14H18V4c0-1.104-0.896-2-2-2s-2,0.896-2,2v10H4c-1.104,0-2,0.896-2,2s0.896,2,2,2h10v10c0,1.104,0.896,2,2,2  s2-0.896,2-2V18h10c1.104,0,2-0.896,2-2S29.104,14,28,14z" />
    </svg>
  )
}
