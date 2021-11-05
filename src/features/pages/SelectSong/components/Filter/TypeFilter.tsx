import { FilterTypeValue } from './types'
import { css } from '@sightread/flake'
import clsx from 'clsx'
import { palette } from '@/styles/common'

const classes = css({
  filterButton: {
    backgroundColor: 'white',
    border: '1px solid black',
    padding: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    outline: 'none',
    '&:focus': {
      outline: 'none',
    },
  },
  filterButtonActive: {
    color: 'white',
    backgroundColor: palette.purple.dark,
  },
})
export default function TypeFilter({
  value,
  onSelect,
}: {
  onSelect: (value: FilterTypeValue) => void
  value: FilterTypeValue
}) {
  const handleSelect = (e: React.MouseEvent<HTMLButtonElement>) => {
    const selectedValue = e.currentTarget.value
    if (selectedValue !== 'song' && selectedValue !== 'upload') {
      return
    }
    if (selectedValue === value) {
      return onSelect(undefined)
    }
    return onSelect(selectedValue)
  }

  return (
    <div>
      <span
        style={{
          marginBottom: '8px',
          display: 'block',
          fontSize: '21px',
          fontWeight: 'bold',
        }}
      >
        Type
      </span>
      <button
        type="button"
        className={clsx(classes.filterButton, {
          [classes.filterButtonActive]: value === 'upload',
        })}
        value="upload"
        onClick={handleSelect}
        style={{
          borderRadius: '8px 0px 0px 8px',
        }}
      >
        Uploads
      </button>
      <button
        type="button"
        className={clsx(classes.filterButton, {
          [classes.filterButtonActive]: value === 'song',
        })}
        value="song"
        style={{
          borderRadius: '0px 8px 8px 0px',
        }}
        onClick={handleSelect}
      >
        Library
      </button>
    </div>
  )
}
