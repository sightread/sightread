import { css } from '@sightread/flake'
import { PauseIcon, PlayIcon, LoadingIcon } from '@/icons'

const classes = css({
  topbarIcon: {
    cursor: 'pointer',
    fill: 'white',
    '&:hover': {
      fill: 'rgba(58, 104, 231, 1)',
    },
    '& .active ': {
      fill: 'rgba(58, 104, 231, 1)',
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
      <PauseIcon width={35} height={35} className={classes.topbarIcon} onClick={onTogglePlaying} />
    )
  }

  if (!isLoading) {
    return (
      <PlayIcon height={25} width={35} className={classes.topbarIcon} onClick={onTogglePlaying} />
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
