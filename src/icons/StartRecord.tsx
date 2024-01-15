import { IconProps } from '@/icons'

// TODO: use a real icon set!
export function StartRecord(props: IconProps) {
  return (
    <svg width={props.size} height={props.size} viewBox="0 0 27 27" {...props}>
      <circle cx="13.5" cy="13.5" r="12.5" />
    </svg>
  )
}
