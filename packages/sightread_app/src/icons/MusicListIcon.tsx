import { IconInput } from './types'

export default function MusicListIcon({ width, height, style, className, onClick }: IconInput) {
  return (
    <svg
      width={width}
      height={height}
      style={style}
      className={className}
      onClick={onClick}
      viewBox="0 0 67 47"
    >
      <path
        d="M42.3158 0H0V6.71429H42.3158V0ZM42.3158 13.4286H0V20.1429H42.3158V13.4286ZM0 33.5714H28.2105V26.8571H0V33.5714ZM49.3684 0V27.4782C48.2576 27.0921 47.0939 26.8571 45.8421 26.8571C40.0061 26.8571 35.2632 31.3725 35.2632 36.9286C35.2632 42.4846 40.0061 47 45.8421 47C51.6782 47 56.4211 42.4846 56.4211 36.9286V6.71429H67V0H49.3684Z"
        fill="#4912D4"
      />
    </svg>
  )
}
