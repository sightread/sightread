import { IconInput } from './types'

function TrashCanIcon({ width, height, style, className, onClick }: IconInput) {
  return (
    <svg
      enableBackground="new 0 0 32 32"
      width={width}
      height={height}
      style={style}
      className={className}
      onClick={onClick}
      viewBox="0 0 32 32"
    >
      <path
        d="M27,6h-6V5c0-1.654-1.346-3-3-3h-4c-1.654,0-3,1.346-3,3v1H5C3.897,6,3,6.897,3,8v1c0,0.552,0.448,1,1,1h24  c0.552,0,1-0.448,1-1V8C29,6.897,28.103,6,27,6z M13,5c0-0.551,0.449-1,1-1h4c0.551,0,1,0.449,1,1v1h-6V5z"
        id="XMLID_246_"
      />
      <path
        d="M6,12v15c0,1.654,1.346,3,3,3h14c1.654,0,3-1.346,3-3V12H6z M19.707,22.293  c0.391,0.391,0.391,1.023,0,1.414s-1.023,0.391-1.414,0L16,21.414l-2.293,2.293c-0.391,0.391-1.023,0.391-1.414,0  s-0.391-1.023,0-1.414L14.586,20l-2.293-2.293c-0.391-0.391-0.391-1.023,0-1.414s1.023-0.391,1.414,0L16,18.586l2.293-2.293  c0.391-0.391,1.023-0.391,1.414,0s0.391,1.023,0,1.414L17.414,20L19.707,22.293z"
        id="XMLID_249_"
      />
    </svg>
  )
}

export default TrashCanIcon
