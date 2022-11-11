import { IconProps } from '@/icons'

export function Midi(props: IconProps) {
  return (
    <svg
      width={props.size ?? '455'}
      height={props.size ?? '455'}
      viewBox="-9.3 -9.8 455 455"
      {...props}
    >
      <path strokeWidth="5" d="M19.2 217.2a198.5 198.5 0 1 0 397 0 198.5 198.5 0 0 0-397 0z" />
      <path
        stroke="#000"
        strokeWidth="5"
        d="M299 217.2a25.1 25.1 0 1 0 50.3 0 25.1 25.1 0 0 0-50.3 0zm-212.9 0a25.1 25.1 0 1 0 50.3 0 25.1 25.1 0 0 0-50.3 0zm38.6-93a25.1 25.1 0 1 0 35.5 35.5 25.1 25.1 0 0 0-35.5-35.5zm93-38.5a25.1 25.1 0 1 0 0 50.2 25.1 25.1 0 0 0 0-50.2zm93 38.5a25.1 25.1 0 1 0-35.5 35.6 25.1 25.1 0 0 0 35.5-35.6z"
      />
      <path
        fill="none"
        stroke="#000"
        strokeWidth="5"
        d="M217.7 35.3a181.9 181.9 0 0 0-36.9 360 37.3 37.3 0 0 1 73.8 0 182 182 0 0 0-36.9-360z"
      />
    </svg>
  )
}
