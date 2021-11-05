import { CSSProperties } from 'react'

export default function MissionSVG({
  width,
  height,
  style,
}: {
  width: number
  height: number
  style?: CSSProperties
}) {
  return (
    <svg width={width} height={height} style={style} viewBox="0 0 396 258" fill="none">
      <path
        d="M220.986 8.44966C223.415 6.55109 223.279 0.822253 198.635 2.81723V26.7578C217.834 24.5281 220.321 27.4619 217.977 29.5732C215.634 31.6845 214.968 34.5009 239.899 31.6845L243.767 11.2653C226.144 12.9082 215.583 12.6735 220.986 8.44966Z"
        fill="#FF6825"
      />
      <path
        d="M146.625 193.773V33.0938L243.767 193.773L146.625 222.499V193.773Z"
        fill="#383838"
        fillOpacity="0.2"
      />
      <path
        d="M146.625 193.773V33.0938L49.4822 193.773L146.625 222.499V193.773Z"
        fill="#CCCCCC"
        fillOpacity="0.2"
      />
      <path
        d="M251.074 196.975V54.2158L331.453 196.975L251.074 222.498V196.975Z"
        fill="#383838"
        fillOpacity="0.2"
      />
      <path
        d="M251.074 196.975V54.2158L170.695 196.975L251.074 222.498V196.975Z"
        fill="#CCCCCC"
        fillOpacity="0.2"
      />
      <path d="M287.386 214.859V84L395.5 214.859L287.386 238.5V214.859Z" fill="#7029FB" />
      <path d="M287.386 214.643V84L178.168 214.643L287.386 238V214.643Z" fill="#EEE5FF" />
      <path d="M107.563 214.402V87L238.844 214.402L107.563 237V214.402Z" fill="#7029FB" />
      <path
        d="M107.939 213.835L107.563 87L-5.34058e-05 215.5L107.011 237.5L107.939 213.835Z"
        fill="#EEE5FF"
      />
      <path d="M198.026 225.196V46L329.859 229.5L198.026 257.233V225.196Z" fill="#7029FB" />
      <path d="M198.205 224.962V45.7666L70.9738 230.243L198.205 256.999V224.962Z" fill="#EEE5FF" />
      <rect x="197.345" width="1.71934" height="47.1753" fill="#A52A2A" />
    </svg>
  )
}
