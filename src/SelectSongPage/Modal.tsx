import * as React from 'react'
import { useRef, useState, useEffect } from 'react'
import { usePlayer } from '../hooks'
import { WindowedSongBoard } from '../WindowedSongboard'
import { PlayableSong, SongScrubBar } from '../pages/play/[...song_location]'
import { getSong, inferHands, Sizer } from '../utils'
import { css } from '../flakecss'
import { BothHandsSVG, Clock, MuiscalNote, Loop } from '../icons'
import Link from 'next/link'

const previewWidth = 600
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
    padding: '0px 20px',
    margin: 'auto',
    backgroundColor: 'white',
    zIndex: 2,
    borderRadius: 5,
  },
  closeModalButton: {
    cursor: 'pointer',
    float: 'right',
    border: 'none',
    background: 'none',
  },
  closeModalIcon: {
    fontSize: 32,
    transition: '150ms',
    color: '#7029FA',
    '&:hover': {
      color: '#3e0ca0',
    },
  },
  songTitle: {
    display: 'inline-block',
    fontSize: '1.8em',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  },
  artist: {
    overflow: 'hidden',
    padding: '0px 10px',
    textAlign: 'center',
    fontSize: '1.4em',
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
    color: 'rgb(176, 176, 176)',
    transition: '150ms',
    '&:hover': {
      color: 'white',
    },
  },
  buttonContainer: { width: previewWidth, display: 'flex', justifyContent: 'space-between' },
  instrumentsButton: {
    color: 'white',
    height: 40,
    border: 'none',
    cursor: 'pointer',
    borderRadius: 5,
    fontSize: 22,
    transition: '150ms',
    backgroundColor: 'grey',
    width: '55%',
    '&:hover': {
      backgroundColor: '#3f3c3c',
    },
  },
  playNowButton: {
    color: 'white',
    height: 40,
    width: '100%',
    border: 'none',
    cursor: 'pointer',
    borderRadius: 5,
    marginLeft: 'auto',
    fontSize: 22,
    transition: '150ms',
    backgroundColor: 'rgb(112, 41, 250)',
    '&:hover': {
      backgroundColor: '#3e0ca0',
    },
  },
  controlsContainer: { padding: '0px 40px' },
  controlsHeader: {
    fontSize: '1.5em',
    fontWeight: 'bold',
    marginBottom: '15px',
  },
  container: { display: 'flex', padding: '20px 0px' },
  textWrapper: { marginLeft: '20px', maxWidth: '190px' },
  controlTitle: { fontWeight: 'bold', paddingBottom: '10px' },
  iconWrapper: {
    display: 'inline-block',
    minWidth: '100px',
    textAlign: 'center',
  },
})

const controlsOverview = [
  {
    title: 'Hand Select',
    caption: 'Practice left, right, or both hands!',
    icon: <BothHandsSVG height={50} width={80} />,
  },
  {
    title: 'Wait',
    caption: 'Pause until you hit the right note.',
    icon: <Clock height={50} width={50} />,
  },
  {
    title: 'Visualization',
    caption: 'Choose between Falling notes or Sheet Music display.',
    icon: <MuiscalNote height={50} width={50} />,
  },
  {
    title: 'Looping',
    caption: 'Select a range to repeat.',
    icon: <Loop width={70} height={44} />,
  },
]

function Modal({ show = true, onClose = () => {}, songMeta = undefined } = {}) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [song, setSong] = useState<PlayableSong | null>(null)
  const [playing, setPlaying] = useState(false)
  const [canPlay, setCanPlay] = useState(false)
  const { player } = usePlayer()

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

  useEffect(() => {
    if (!songMeta || !(songMeta as any).file) {
      return
    }
    getSong(`${(songMeta as any).file}`)
      .then(inferHands)
      .then((song: PlayableSong) => {
        setCanPlay(false)
        setSong(song)
        player.setSong(song).then(() => {
          setCanPlay(true)
        })
      })
    return () => {
      player.stop()
      setPlaying(false)
    }
  }, [songMeta, player])

  if (!show || !song) {
    return null
  }

  const { file, name, artist } = songMeta as any

  return (
    <div className={classes.modalContainer}>
      <div ref={modalRef} className={classes.modalContent}>
        <Sizer height={20} />
        <button className={classes.closeModalButton} onClick={onClose}>
          <i className={`${classes.closeModalIcon} fas fa-window-close`} />
        </button>
        <div>
          <span className={classes.songTitle}>{name}</span>
          <span className={classes.artist}>{artist}</span>
        </div>
        <Sizer height={30} />
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div
            style={{
              width: previewWidth,
              minWidth: previewWidth,
              borderRadius: 6,
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'relative' }}>
              <div className={classes.scrubBarBorder} />
              <SongScrubBar song={song} width={previewWidth} height={20} />
            </div>
            <div style={{ backgroundColor: '#2e2e2e', margin: '0 auto' }}>
              <div onClick={handleTogglePlay} style={{ position: 'relative' }}>
                {!playing && (
                  <i
                    className={`${classes.modalPlayBtn} fas fa-play`}
                    onClick={() => {
                      if (canPlay) {
                        player.play()
                        setPlaying(true)
                      }
                    }}
                  />
                )}
                <WindowedSongBoard
                  width={previewWidth}
                  height={330}
                  song={song}
                  hand={'both'}
                  position="absolute"
                />
              </div>
            </div>
            <Sizer height={16} />
            <div className={classes.buttonContainer}>
              <Link href={`/play/${file}`}>
                <a style={{ width: '40%' }}>
                  <button className={classes.playNowButton}>Play Now</button>
                </a>
              </Link>
              <button className={classes.instrumentsButton} onClick={() => console.log('todod')}>
                Adjust Instruments
              </button>
            </div>
            <Sizer height={35} />
          </div>
          <div className={classes.controlsContainer}>
            <h3 className={classes.controlsHeader}>Controls Overview</h3>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexDirection: 'column',
              }}
            >
              {controlsOverview.map((o) => {
                return (
                  <div className={classes.container} key={o.title}>
                    <span className={classes.iconWrapper}>{o.icon}</span>
                    <div className={classes.textWrapper}>
                      <h4 className={classes.controlTitle}>{o.title}</h4>
                      <p>{o.caption}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <Sizer height={35} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal
