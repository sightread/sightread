import { defaultCipherList } from 'constants'
import { IconInput } from './types'

export default function FileBoxIcon({ width, height, style, className, onClick }: IconInput) {
  return (
    <svg
      width={width}
      height={height}
      style={style}
      className={className}
      onClick={onClick}
      viewBox="0 0 42 40"
      fill="none"
    >
      <path
        d="M39.7742 9.80548H2.43822C2.17529 9.80548 2 9.6174 2 9.33527V2.94042C2 2.37617 2.35057 2 2.87643 2H39.4236C39.9495 2 40.3 2.37617 40.3 2.94042V9.33527C40.2124 9.6174 40.0371 9.80548 39.7742 9.80548Z"
        stroke="#4912D4"
        strokeWidth="3"
        strokeMiterlimit="10"
        strokeLinecap="round"
      />
      <path
        d="M36.4436 38.488H5.76852C5.24266 38.488 4.89209 38.1118 4.89209 37.5475V9.8053H37.4077V37.5475C37.3201 38.0178 36.9695 38.488 36.4436 38.488Z"
        stroke="#4912D4"
        strokeWidth="3"
        strokeMiterlimit="10"
        strokeLinecap="round"
      />
      <path
        d="M27.5043 21.6545H15.1466C13.7443 21.6545 12.605 20.4319 12.605 18.9273C12.605 17.4226 13.7443 16.2001 15.1466 16.2001H27.5043C28.9066 16.2001 30.046 17.4226 30.046 18.9273C30.046 20.3379 28.9066 21.6545 27.5043 21.6545Z"
        stroke="#4912D4"
        strokeWidth="3"
        strokeMiterlimit="10"
        strokeLinecap="round"
      />
    </svg>
  )
}
