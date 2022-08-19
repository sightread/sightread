import { css } from '@sightread/flake'
import { PauseIcon, PlayIcon, LoadingIcon } from '@/icons'
import { palette } from '@/styles/common'

const classes = css({
  topbarIcon: {
    cursor: 'pointer',
    fill: 'white',
    '&:hover': {
      fill: palette.purple.primary,
    },
    '& .active ': {
      fill: palette.purple.primary,
    },
  },
})
export default function StatusIcon({
  isPlaying,
  onTogglePlaying,
  isLoading,
}: {
  isPlaying: boolean
  onTogglePlaying: () => void
  isLoading: boolean
}) {
  if (isPlaying) {
    return (
      <span data-tooltip="Pause" data-tooltip-position="bottom">
        <PauseIcon
          width={35}
          height={35}
          className={classes.topbarIcon}
          onClick={onTogglePlaying}
        />
      </span>
    )
  }

  if (!isLoading) {
    return (
      <span data-tooltip="Play" data-tooltip-position="bottom">
        <PlayIcon height={25} width={35} className={classes.topbarIcon} onClick={onTogglePlaying} />
      </span>
    )
  }
  return (
    <LoadingIcon
      width={35}
      height={35}
      style={{
        fill: 'white',
        animation: 'spinner 2s infinite linear',
        margin: 0,
        padding: 0,
      }}
    />
  )
}
