import * as React from 'react'
import { useRef, useState, useEffect } from 'react'
import { usePlayer, useWindowSize } from '../hooks'
import { WindowedSongBoard } from '../WindowedSongboard'
import { PianoRoll, PlayableSong, SongScrubBar } from '../pages/play/[...song_location]'
import { getSong, inferHands, Sizer, formatTime } from '../utils'
import { useRouter } from 'next/router'
import { css } from '../flakecss'

function Modal({ show = true, onClose = () => {}, songMeta = undefined } = {}) {
  const { width: windowWidth } = useWindowSize()
  const modalRef = useRef<HTMLDivElement>(null)
  const [song, setSong] = useState<PlayableSong | null>(null)
  const [playing, setPlaying] = useState(false)
  const { player } = usePlayer()
  const router = useRouter()

  const handleTogglePlay = () => {
    if (playing) {
      player.pause()
      setPlaying(false)
    } else {
      player.play()
      setPlaying(true)
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
        setSong(song)
        player.setSong(song)
      })
    return () => {
      player.stop()
      setPlaying(false)
    }
  }, [songMeta, player])

  if (!show || !song) {
    return null
  }

  const { file, name } = songMeta as any
  const width = Math.min(800, windowWidth - 200)
  const innerWidth = width - 100

  css(
    {
      '.close-modal': {
        color: 'rgb(174, 1, 1)',
        fontSize: 24,
        transition: '150ms',
      },
      '.close-modal:hover': {
        color: 'rgb(174, 1, 1, 0.5)',
      },
      '.modal-play-btn': {
        color: 'rgb(176, 176, 176)',
        transition: '150ms',
      },
      '.modal-play-btn:hover': {
        color: 'white',
      },
      '.selectsong__play-now-btn': {
        backgroundColor: 'rgb(174, 1, 1)',
      },
      '.selectsong__play-now-btn:hover': {
        backgroundColor: 'rgba(174, 1, 1, 0.5)',
      },
    },
    'SelectSongPage.ModalShit',
  )
  return (
    <>
      <div
        style={{
          position: 'fixed',
          height: '100vh',
          width: '100vw',
          zIndex: 2,
          backgroundColor: 'rgba(126,126,126, 0.65)',
        }}
      />
      <div
        ref={modalRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          width,
          height: 600,
          backgroundColor: 'white',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
          borderRadius: 5,
        }}
      >
        <button
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            cursor: 'pointer',
            border: 'none',
            background: 'none',
          }}
          onClick={onClose}
        >
          <i className="close-modal fas fa-window-close" />
        </button>
        {!playing && (
          <i
            className="modal-play-btn fas fa-play"
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%,-50%)',
              fontWeight: 900,
              fontSize: 69,
              zIndex: 1,
              cursor: 'pointer',
            }}
            onClick={() => {
              player.play()
              setPlaying(true)
            }}
          />
        )}
        <div
          style={{
            display: 'flex',
            width: innerWidth,
            flexDirection: 'column',
            margin: '0 auto',
            height: '100%',
          }}
        >
          <Sizer height={16} />
          <h4 style={{ fontSize: 30, fontWeight: 600 }}>{name}</h4>
          <Sizer height={16} />
          <div
            style={{
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                boxShadow: 'inset 0px 4px 4px rgba(0, 0, 0, 0.25)',
                zIndex: 5,
                pointerEvents: 'none',
                borderRadius: 5,
              }}
            />
            <SongScrubBar song={song} width={innerWidth} />
          </div>
          <div style={{ backgroundColor: '#2e2e2e', width: innerWidth, margin: '0 auto' }}>
            <div onClick={handleTogglePlay}>
              <WindowedSongBoard width={innerWidth} height={330} song={song} hand={'both'} />
            </div>
            <PianoRoll width={innerWidth} selectedHand={'both'} song={song} />
          </div>
          <div
            style={{
              height: 40,
              width: innerWidth,
              margin: '0 auto',
              marginTop: 'auto',
              display: 'flex',
              flexDirection: 'row',
              fontSize: 22,
              fontWeight: 600,
              lineHeight: '40px', // vertically center hack.
            }}
          >
            <span>Difficulty:</span>
            <Sizer width={8} />
            <span style={{ color: 'green' }}>Easy</span>
            <Sizer width={36} />
            <span>Duration:</span>
            <Sizer width={8} />
            <span style={{ color: 'gray' }}>{formatTime(song.duration)}</span>
            <button
              className="selectsong__play-now-btn"
              style={{
                width: 120,
                color: 'white',
                height: 40,
                border: 'none',
                cursor: 'pointer',
                borderRadius: 5,
                marginLeft: 'auto',
                fontSize: 22,
                transition: '150ms',
              }}
              onClick={() => router.push(`/play/${file}`)}
            >
              Play Now
            </button>
          </div>
          <Sizer height={16} />
        </div>
      </div>
    </>
  )
}

export default Modal
