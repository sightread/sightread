import * as React from 'react'
import { useRef, useState, useEffect, useMemo } from 'react'
import { Song, SongConfig } from '@/types'
import { SongVisualizer } from '@/features/PlaySongPage'
import { getHandSettings, getSongSettings } from '@/features/PlaySongPage/utils'
import { SongScrubBar } from '@/pages/play/[...song_location]'
import { getSong, Sizer } from '@/utils'
import Player from '@/player'
import {
  BothHandsIcon,
  ClockIcon,
  MusicalNoteIcon,
  DoubleArrowLoopIcon,
  CancelCircleIcon,
  PlayIcon,
  LoadingIcon,
} from '@/icons'
import { css } from '@sightread/flake'
import { useRouter } from 'next/router'
import { useSongSettings } from '@/hooks/song-config'
import { palette } from '@/styles/common'

const classes = css({
  modalContainer: {
    position: 'fixed',
    padding: 40,
    boxSizing: 'border-box',
    zIndex: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    left: 0,
    top: 0,
    width: '100%' /* Full width */,
    height: '100%' /* Full height */,
    overflow: 'auto' /* Enable scroll if needed */,
    backgroundColor: 'rgba(126,126,126, 0.65)' /* Fallback color */,
  },
  modalContent: {
    border: '1px solid #888',
    maxWidth: 1100,
    padding: '32px 32px 0px 32px',
    margin: 'auto',
    backgroundColor: 'white',
    zIndex: 2,
    borderRadius: 5,
  },
  closeModalButton: {
    cursor: 'pointer',
    marginLeft: 'auto',
    border: 'none',
    background: 'none',
    outline: 'none',
  },
  closeModalIcon: {
    transition: '150ms',
    outline: 'none',
    '&:hover path': {
      fill: palette.purple.dark,
    },
  },
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
  buttonContainer: { width: '100%', display: 'flex', justifyContent: 'space-between' },
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

const controlsOverview = [
  {
    title: 'Hand Select',
    caption: 'Practice left, right, or both hands!',
    icon: <BothHandsIcon height={35} width={50} />,
  },
  {
    title: 'Wait',
    caption: 'Pause until you hit the right note.',
    icon: <ClockIcon height={35} width={35} />,
  },
  {
    title: 'Visualization',
    caption: 'Choose between Falling notes or Sheet Music display.',
    icon: <MusicalNoteIcon height={35} width={35} />,
  },
  {
    title: 'Looping',
    caption: 'Select a range to repeat.',
    icon: <DoubleArrowLoopIcon width={35} height={35} />,
  },
]

// TODO: have a way to reset to default track settings (adjust instruments)
// TODO: remove count from trackSettings (notes per track) as it is static
// TODO: put warning that you will have to return here to change the settings again?
type ModalProps = {
  show: boolean
  onClose: () => void
  songMeta?: { file: string; name: string; artist: string }
}
function Modal({ show = true, onClose = () => {}, songMeta = undefined }: ModalProps) {
  const { file, name, artist } = songMeta ?? {}
  const modalRef = useRef<HTMLDivElement>(null)
  const [song, setSong] = useState<Song | null>(null)
  const [songConfig, setSongConfig] = useSongSettings('unknown')
  const [playing, setPlaying] = useState(false)
  const [canPlay, setCanPlay] = useState(false)
  const router = useRouter()
  const player = Player.player()
  const songConfigOverride = useMemo<SongConfig>(
    () => ({
      ...songConfig,
      visualization: 'falling-notes',
      wait: false,
    }),
    [songConfig],
  )

  function setupModal(song: Song) {
    setCanPlay(false)
    setSong(song)
  }

  useEffect(() => {
    if (!songMeta?.file) {
      return
    }
    getSong(`${songMeta.file}`).then((song) => {
      setupModal(song)
      const config = getSongSettings(songMeta.file, song)
      setSongConfig(config)
      player.setSong(song, config).then(() => {
        setCanPlay(true)
      })
    })
    return () => {
      player.stop()
      setPlaying(false)
    }
  }, [songMeta, player])

  useEffect(() => {
    if (!show) {
      return
    }

    function outsideClickHandler(e: MouseEvent) {
      if (!modalRef.current) {
        return
      }

      if (!modalRef.current.contains(e.target as Node)) {
        setSong(null)
        onClose()
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (!modalRef.current) {
        return
      }
      const keyPressed = e.key
      if (keyPressed === 'Escape') {
        setSong(null)
        return onClose()
      }
      if (keyPressed === ' ') {
        e.preventDefault()
        return handleTogglePlay()
      }
    }

    window.addEventListener('mousedown', outsideClickHandler)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('mousedown', outsideClickHandler)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [show, onClose, playing])

  const handlePlayNow = () => {
    if (!song) {
      console.error('Song must be loaded to play.')
      return
    }

    router.push(`/play/${file}`)
  }

  const handleTogglePlay = () => {
    if (playing) {
      player.pause()
      setPlaying(false)
    } else {
      if (canPlay) {
        player.play()
        setPlaying(true)
      }
    }
  }

  if (!show || !song) {
    return null
  }

  return (
    <div className={classes.modalContainer}>
      <div
        ref={modalRef}
        className={classes.modalContent}
        style={{
          minWidth: 'min(600px, 80%)',
          width: 'min(860px, 80%)',
        }}
      >
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
              <span className={classes.songTitle}>{name}</span>
              <span className={classes.artist}>{artist}</span>
            </div>
            <button className={classes.closeModalButton} onClick={onClose}>
              <CancelCircleIcon width={30} height={30} className={classes.closeModalIcon} />
            </button>
          </div>
          <div
            style={{
              display: 'flex',
              borderRadius: 6,
              flexDirection: 'column',
              flexGrow: 1,
            }}
          >
            <div style={{ position: 'relative', height: 24, minHeight: 24 }}>
              <div className={classes.scrubBarBorder} />
              <SongScrubBar song={song} />
            </div>
            <div
              style={{
                position: 'relative',
                backgroundColor: '#2e2e2e',
                height: 340, // TODO, do this less hacky
                minHeight: 340, // without height and min-height set, causes canvas re-paint on adjust instruments open
                width: '100%',
                overflow: 'hidden', // WHY IS THIS NEEDED? // if you want rounded corners, -jake
              }}
              onClick={handleTogglePlay}
            >
              {!playing &&
                ((canPlay && (
                  <PlayIcon
                    height={60}
                    width={60}
                    className={classes.modalPlayBtn}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (canPlay) {
                        player.play()
                        setPlaying(true)
                      }
                    }}
                  />
                )) || (
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
                ))}
              <SongVisualizer
                song={song}
                handSettings={getHandSettings(songConfig)}
                hand="both"
                config={songConfigOverride}
                getTime={() => Player.player().getTime()}
              />
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
          <div>
            <h3 className={classes.controlsHeader}>Controls Overview</h3>
            <div>
              {controlsOverview.map(({ title, icon, caption }) => {
                return (
                  <div className={classes.container} key={title}>
                    <span className={classes.iconWrapper}>{icon}</span>
                    <div className={classes.textWrapper}>
                      <h4 className={classes.controlTitle}>{title}</h4>
                      <p>{caption}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal
