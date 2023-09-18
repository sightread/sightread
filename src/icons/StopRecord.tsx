import { IconProps } from '@/icons'

export function StopRecord(props: IconProps) {
  return (
    <svg width={props.size} height={props.size} viewBox="0 0 27 27" {...props}>
      <rect x="3" y="3" width="21" height="21" className='fill-red-500 hover:fill-purple-hover'/>
    </svg>
  )
}
