import { IconInput } from './types'

function FilterIcon({ width, height, style, className, onClick }: IconInput) {
  return (
    <svg
      width={width}
      height={height}
      style={style}
      className={className}
      onClick={onClick}
      viewBox="0 0 32 32"
    >
      <g id="Fill">
        <path d="M12,30.41v-15L1.89,3H30.11L20,15.36v5.81a3,3,0,0,1-.88,2.12ZM6.11,5,14,14.64v11l3.71-3.71a1.05,1.05,0,0,0,.29-.71V14.64L25.89,5Z" />
      </g>
    </svg>
  )
}

export default FilterIcon
