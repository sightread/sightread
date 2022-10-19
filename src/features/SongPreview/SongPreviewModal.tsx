import * as React from 'react'
import { useEffect } from 'react'
import { SongScrubBar } from '../SongInputControls'
import { BothHandsIcon, ClockIcon, MusicalNoteIcon, DoubleArrowLoopIcon } from '@/icons'
import { css, mediaQuery } from '@sightread/flake'
import { useRouter } from 'next/router'
import { usePlayerState } from '@/hooks'
import { palette } from '@/styles/common'
import { Modal, Sizer } from '@/components'
import PreviewIcon from './PreviewIcon'
import { LibrarySong } from '../pages/SelectSong/types'
import { SongPreview } from './SongPreview'

const classes = css({
  songTitle: {
    display: 'inline-block',
    fontSize: '24px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  },
  artist: {
    overflow: 'hidden',
    padding: '0px 10px',
    textAlign: 'center',
    fontWeight: 600,
    color: '#848484',
    fontSize: '16px',
  },
  scrubBarBorder: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    boxShadow: 'inset 0px 4px 4px rgba(0, 0, 0, 0.25)',
    zIndex: 5,
    pointerEvents: 'none',
    borderRadius: 5,
  },
  modalContent: {
    [mediaQuery.up(450)]: {
      minWidth: 'min(600px, 80%)',
      width: 'min(600px, 80%)',
    },
    [mediaQuery.down(450)]: {
      padding: '0px 16px 0px 16px',
    },
  },
  buttonContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    minWidth: 300,
  },
  baseButton: {
    transition: '150ms',
    borderRadius: 5,
    fontSize: 22,
    height: 40,
    border: 'none',
    cursor: 'pointer',
    width: '100%',
  },
  instrumentsButton: {
    color: palette.purple.primary,
    backgroundColor: 'white',
    boxShadow: '0px 0px 7px rgba(0, 0, 0, 0.2)',
    '&:hover': {
      backgroundColor: '#EAEAEA',
    },
  },
  playNowButton: {
    color: 'white',
    height: 40,
    width: '42%',
    border: 'none',
    cursor: 'pointer',
    borderRadius: 5,
    fontSize: 22,
    transition: '150ms',
    backgroundColor: palette.purple.primary,
    '&:hover': {
      backgroundColor: palette.purple.dark,
    },
  },
  controlsHeader: {
    fontSize: '20px',
    marginBottom: '15px',
  },
  container: { display: 'flex', padding: '11px 0px' },
  textWrapper: { marginLeft: '20px', maxWidth: '224px' },
  controlTitle: { fontWeight: 'bold', paddingBottom: '10px' },
  iconWrapper: {
    width: '60px',
    height: '60px',
    borderRadius: '6px',
    backgroundColor: palette.purple.light,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
})

// TODO: have a way to reset to default track settings (adjust instruments)
// TODO: remove count from trackSettings (notes per track) as it is static
// TODO: put warning that you will have to return here to change the settings again?
type ModalProps = {
  show: boolean
  onClose: () => void
  songMeta?: LibrarySong
}
export default function SongPreviewModal({
  show = true,
  onClose = () => {},
  songMeta = undefined,
}: ModalProps) {
  const { title, artist, id, source } = songMeta ?? {}
  const router = useRouter()
  const [playerState, playerActions] = usePlayerState()

  useEffect(() => {
    if (!show) {
      return
    }

    function handleKeyDown(e: KeyboardEvent) {
      const keyPressed = e.key
      if (keyPressed === ' ') {
        e.preventDefault()
        return playerActions.toggle()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [show, onClose, playerState.playing, playerActions])

  const handleClose = () => {
    playerActions.reset()
    return onClose()
  }

  const handlePlayNow = () => {
    if (!id || !source) {
      console.error('Song must be loaded to play.')
      return
    }

    router.push(`/play?id=${id}&source=${source}`)
  }

  if (!show || !id) {
    return null
  }

  return (
    <Modal show={show && !!id} onClose={handleClose} classNames={classes.modalContent}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: 'row',
          justifyContent: 'space-between',
          rowGap: 16,
          columnGap: 30,
        }}
      >
        <div style={{ display: 'flex', width: '100%' }}>
          <div>
            <span className={classes.songTitle}>{title}</span>
            <span className={classes.artist}>{artist}</span>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            borderRadius: 6,
            flexDirection: 'column',
            flexGrow: 1,
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'relative', height: 24, minHeight: 24 }}>
            <div className={classes.scrubBarBorder} />
            <SongScrubBar />
          </div>
          <div
            style={{
              position: 'relative',
              backgroundColor: '#2e2e2e',
              height: 340, // TODO, do this less hacky
              minHeight: 340, // without height and min-height set, causes canvas re-paint on adjust instruments open
              width: '100%',
              overflow: 'hidden',
            }}
            onClick={playerActions.toggle}
          >
            <PreviewIcon
              isLoading={!playerState.canPlay}
              isPlaying={playerState.playing}
              onPlay={(e) => {
                e.stopPropagation()
                playerActions.play()
              }}
            />
            {id && source && (
              <SongPreview songId={id} source={source} onReady={playerActions.ready} />
            )}
          </div>
          <Sizer height={16} />
          <div className={classes.buttonContainer}>
            <button
              className={classes.playNowButton}
              onClick={handlePlayNow}
              style={{ width: '100%' }}
            >
              Play Now
            </button>
          </div>
          <Sizer height={16} />
        </div>
      </div>
    </Modal>
  )
}
