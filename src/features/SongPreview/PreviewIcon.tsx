import { PlayIcon, LoadingIcon } from '@/icons'
import { css } from '@sightread/flake'
import { MouseEvent } from 'react'

const classes = css({
  modalPlayBtn: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%,-50%)',
    fontWeight: 900,
    fontSize: 69,
    zIndex: 1,
    cursor: 'pointer',
    transition: '150ms',
    '& path': {
      fill: 'rgb(176, 176, 176)',
      transition: '150ms',
    },
    '&:hover path': {
      fill: 'white',
    },
  },
  modalSpinnerIcon: { fill: 'white', animation: 'spinner 2s infinite linear' },
})

type PreviewIconProps = {
  isPlaying: boolean
  isLoading: boolean
  onPlay: (e: MouseEvent) => void
}
export default function PreviewIcon({ isPlaying, isLoading, onPlay }: PreviewIconProps) {
  if (isPlaying) {
    return null
  }
  if (isLoading) {
    return (
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 60,
          height: 60,
          zIndex: 1,
        }}
      >
        <LoadingIcon width={60} height={60} className={classes.modalSpinnerIcon} />
      </div>
    )
  }
  return <PlayIcon height={60} width={60} className={classes.modalPlayBtn} onClick={onPlay} />
}
