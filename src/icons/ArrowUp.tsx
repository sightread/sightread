import * as React from 'react'
import { IconInput } from './types'
export default function ArrowUp({ width, height, className, onClick }: IconInput) {
  return (
    <svg
      viewBox="0 0 512 512"
      onClick={onClick}
      height={height}
      width={width}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M201.4 137.4c12.5-12.5 32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L224 205.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160z" />
    </svg>
  )
}
