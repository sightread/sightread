import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Song,
  PlayableSong,
  Hand,
  SongNote,
  MidiStateEvent,
  SongConfig,
  VisualizationMode,
} from '@/types'
import {
  RuleLines,
  BpmDisplay,
  PianoRoll,
  SongVisualizer,
  SettingsSidebar,
} from '@/features/PlaySongPage'
import { getHandSettings, getSongRange, getSongSettings } from '@/features/PlaySongPage/utils'
import {
  ArrowLeftIcon,
  PreviousIcon,
  PauseIcon,
  PlayIcon,
  HistoryIcon,
  SoundOnIcon,
  LoadingIcon,
  SoundOffIcon,
  SettingsCog,
} from '@/icons'
import Player from '@/player'
import { useRAFLoop, useSingleton } from '@/hooks'
import { formatTime, getSong, isBlack, mapValues, peek, Sizer } from '@/utils'
import { useSize } from '@/hooks/size'
import { css } from '@sightread/flake'
import { GetServerSideProps } from 'next'
import { default as ErrorPage } from 'next/error'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import { getSynthStub } from '@/synth'
import { SubscriptionCallback } from '@/features/PlaySongPage/PianoRoll'
import midiState from '@/features/midi'
import * as wakelock from '@/wakelock'
import { Toggle } from '@/components'
import { useSongSettings } from '@/hooks/song-config'

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const props = {
    props: {},
  }
  if (query === undefined) {
    return props
  }
  const song_location = query.song_location
  if (!Array.isArray(song_location) || song_location.length < 3) {
    return props
  }
  const type = song_location.includes('lessons') ? 'lesson' : 'song'
  return {
    props: { type, songLocation: song_location.join('/') },
  }
}

type PlaySongProps = {
  type: 'lesson' | 'song'
  songLocation: string
  viz: VisualizationMode
}

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
  figmaIcon: {
    '&:hover path': {
      fill: 'rgba(58, 104, 231, 1)',
    },
    '&:hover path.outline': {
      fill: 'black',
    },
    '& path': {
      cursor: 'pointer',
    },
    cursor: 'pointer',
  },
  fillWhite: {
    '& path': {
      fill: 'white',
    },
    fill: 'white',
  },
  active: {
    '& path': {
      fill: 'rgba(58, 104, 231, 1)',
    },
    '& path.outline': {
      fill: 'black',
    },
  },
  topbar: {
    '& i': {
      color: 'white',
      cursor: 'pointer',
      transition: 'color 0.1s',
      fontSize: 24,
      width: 22,
    },
    '& i:hover': {
      color: 'rgba(58, 104, 231, 1)',
    },
    '& i.active': {
      color: 'rgba(58, 104, 231, 1)',
    },
  },
})

function App({ type, songLocation }: PlaySongProps) {
  const [sidebar, setSidebar] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [rangeSelecting, setRangeSelecting] = useState(false)
  const [soundOff, setSoundOff] = useState(false)
  const [canPlay, setCanPlay] = useState<boolean>(false)
  const router = useRouter()
  const player = Player.player()
  const synth = useSingleton(() => getSynthStub('acoustic_grand_piano'))
  const [song, setSong] = useState<Song>()
  const keyColorUpdater = useRef<SubscriptionCallback>(null)
  const [songConfig, setSongConfig] = useSongSettings(songLocation)

  const hand =
    songConfig.left && songConfig.right
      ? 'both'
      : songConfig.left
      ? 'left'
      : songConfig.right
      ? 'right'
      : 'none'

  // Stops screen from dimming during a song.
  useEffect(() => {
    wakelock.lock()
    return () => wakelock.unlock()
  }, [])

  // Hack for updating player when config changes.
  // Maybe move to the onChange? Or is this chill.
  const { waiting, left, right } = songConfig
  useEffect(() => {
    player.setWait(waiting)
    if (left && right) {
      player.setHand('both')
    } else {
      player.setHand(left ? 'left' : 'right')
    }
  }, [player, waiting, left, right])

  // Register ummount fns
  useEffect(() => {
    return () => {
      player.stop()
    }
  }, [player])

  useEffect(() => {
    if (!songLocation || !type) return

    setCanPlay(false)
    getSong(songLocation).then((song: Song) => {
      const config = getSongSettings(songLocation, song)
      setSong(song)
      setSongConfig(config)
      player.setSong(song, config).then(() => setCanPlay(true))
    })
  }, [songLocation, player, type, setSongConfig])

  useEffect(() => {
    const keyboardHandler = (evt: KeyboardEvent) => {
      if (evt.code === 'Space') {
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
    }
    window.addEventListener('keydown', keyboardHandler, { passive: true })
    return () => window.removeEventListener('keydown', keyboardHandler)
  }, [playing, player, canPlay])

  useEffect(() => {
    const handleEvent = () => {
      const pressed = mapValues(player.getPressedKeys(), (note) => {
        return { color: getTrackColor(note, songConfig) }
      })
      for (let midiNote of midiState.getPressedNotes().keys()) {
        pressed[midiNote] = { color: 'grey' }
      }
      keyColorUpdater.current?.(pressed)
    }
    const handleMidiEvent = ({ type, note }: MidiStateEvent) => {
      handleEvent()
      if (type === 'down') {
        synth.playNote(note)
      } else {
        synth.stopNote(note)
      }
    }

    midiState.subscribe(handleMidiEvent)
    Player.player().subscribe(handleEvent)
    return function cleanup() {
      Player.player().unsubscribe(handleEvent)
      midiState.unsubscribe(handleMidiEvent)
    }
  }, [player, synth, song, songConfig])

  if (!type || !songLocation) {
    return <ErrorPage statusCode={404} title="Song Not Found :(" />
  }

  const handleToggleSound = () => {
    if (!soundOff) {
      player.setVolume(0)
      return setSoundOff(true)
    }
    player.setVolume(1)
    setSoundOff(false)
  }

  const togglePlaying = () => {
    if (!playing) {
      if (canPlay) {
        player.play()
        setPlaying(true)
      }
    } else {
      player.pause()
      setPlaying(false)
    }
  }

  let statusIcon
  if (playing) {
    statusIcon = (
      <PauseIcon width={35} height={35} className={classes.topbarIcon} onClick={togglePlaying} />
    )
  } else if (canPlay) {
    statusIcon = (
      <PlayIcon height={25} width={35} className={classes.topbarIcon} onClick={togglePlaying} />
    )
  } else {
    statusIcon = (
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

  const { startNote, endNote } = getSongRange(song)
  return (
    <div className="App">
      <div
        className={classes.topbar}
        style={{
          position: 'fixed',
          top: 0,
          height: 55,
          width: '100vw',
          zIndex: 2,
          backgroundColor: '#292929',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ width: 250 }}>
          <ArrowLeftIcon
            className={classes.topbarIcon}
            height={40}
            width={50}
            onClick={() => {
              player.pause()
              router.back()
            }}
          />
        </div>
        <div
          className="nav-buttons"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-around',
            width: 230,
          }}
        >
          <hr style={{ width: 1, height: 40, backgroundColor: 'white', border: 'none' }} />
          <PreviousIcon
            className={classes.topbarIcon}
            height={40}
            width={40}
            onClick={() => {
              player.stop()
              setPlaying(false)
            }}
          />

          <hr style={{ width: 1, height: 40, backgroundColor: 'white', border: 'none' }} />
          {statusIcon}
          <hr style={{ width: 1, height: 40, backgroundColor: 'white', border: 'none' }} />
          <BpmDisplay />
          <hr style={{ width: 1, height: 40, backgroundColor: 'white', border: 'none' }} />
        </div>
        <div
          style={{
            display: 'flex',
            marginLeft: 'auto',
            alignItems: 'center',
            minWidth: 150,
            marginRight: 20,
          }}
        >
          <hr style={{ width: 1, height: 40, backgroundColor: 'white', border: 'none' }} />
          <SettingsCog
            width={25}
            height={25}
            className={clsx(classes.figmaIcon, classes.fillWhite, sidebar && classes.active)}
            onClick={() => setSidebar(!sidebar)}
          />
          <hr style={{ width: 1, height: 40, backgroundColor: 'white', border: 'none' }} />
          <span
            className={classes.figmaIcon}
            style={{ display: 'inline-block' }}
            onClick={() => {
              setRangeSelecting(!rangeSelecting)
              setPlaying(false)
              player.pause()
            }}
          >
            <HistoryIcon
              width={25}
              height={25}
              className={clsx(
                classes.figmaIcon,
                classes.fillWhite,
                rangeSelecting && classes.active,
              )}
            />
          </span>
          <hr style={{ width: 1, height: 40, backgroundColor: 'white', border: 'none' }} />
          <span
            className={classes.figmaIcon}
            style={{ display: 'inline-block' }}
            onClick={handleToggleSound}
          >
            {soundOff ? (
              <SoundOffIcon
                width={25}
                height={25}
                className={clsx(classes.figmaIcon, classes.fillWhite)}
              />
            ) : (
              <SoundOnIcon
                width={25}
                height={25}
                className={clsx(classes.figmaIcon, classes.fillWhite)}
              />
            )}
          </span>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 55, height: 40, width: '100%' }}>
        <SongScrubBar
          song={song ?? null}
          rangeSelecting={rangeSelecting}
          setRangeSelecting={setRangeSelecting}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 95,
          width: 300,
          height: 'calc(100% - 95px)',
          right: 0,
          visibility: sidebar ? 'visible' : 'hidden',
          zIndex: 2,
        }}
      >
        <SettingsSidebar open={sidebar} onChange={setSongConfig} config={songConfig} song={song} />
      </div>
      <div
        style={{
          backgroundColor: songConfig.visualization === 'sheet' ? 'white' : '#2e2e2e',
          width: '100vw',
          height: 'calc(100vh - 95px)',
          marginTop: 95,
          contain: 'strict',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <RuleLines />
        <div style={{ position: 'relative', flex: 1 }}>
          <SongVisualizer
            song={song}
            config={songConfig}
            hand={hand}
            handSettings={getHandSettings(songConfig)}
            getTime={() => Player.player().getTime()}
          />
        </div>
        {songConfig.visualization === 'falling-notes' && (
          <PianoRoll
            activeColor="grey"
            onNoteDown={(n: number) => {
              synth.playNote(n)
            }}
            onNoteUp={(n: number) => {
              synth.stopNote(n)
            }}
            startNote={startNote}
            endNote={endNote}
            setKeyColorUpdater={(fn) => (keyColorUpdater.current = fn)}
          />
        )}
      </div>
    </div>
  )
}

// TODO: animate filling up the green of current measure
// TODO support seeking to start of current measure
export function SongScrubBar({
  song,
  rangeSelecting = false,
  setRangeSelecting = () => {},
}: {
  song: Song | null
  rangeSelecting?: boolean
  setRangeSelecting?: any
}) {
  const [mousePressed, setMousePressed] = useState(false) // TODO: mouse state shouldn't need to be ui state.
  const [mouseOver, setMouseOver] = useState(false)
  const divRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { width, measureRef } = useSize()
  const currentTimeRef = useRef<HTMLSpanElement>(null)
  const timeSpanRef = useRef<HTMLSpanElement>(null)
  const measureSpanRef = useRef<HTMLSpanElement>(null)
  const toolTipRef = useRef<HTMLDivElement>(null)
  const rangeRef = useRef<HTMLDivElement>(null)
  const rangeSelection = useRef<null | { start: number; end: number }>(null)
  const startX = useRef<number>(0)
  const player = Player.player()

  const getProgress = useCallback(
    (x: number) => {
      return Math.min(Math.max((x - startX.current) / width, 0), 1)
    },
    [width],
  )

  useRAFLoop(() => {
    if (!divRef.current) {
      return
    }
    const progress = Math.min(player.getTime() / player.getDuration(), 1)
    divRef.current.style.transform = `translateX(${progress * width}px)`
    if (currentTimeRef.current) {
      const time = player.getRealTimeDuration(0, player.getTime())
      currentTimeRef.current.innerText = String(formatTime(time))
    }
    if (rangeRef.current && rangeSelection.current) {
      const start = Math.min(rangeSelection.current.start, rangeSelection.current.end)
      const end = Math.max(rangeSelection.current.start, rangeSelection.current.end)
      rangeRef.current.style.left = (start / player.getDuration()) * width + 'px'
      rangeRef.current.style.width = ((end - start) / player.getDuration()) * width + 'px'
    }
  })
  useEffect(() => {
    if (wrapperRef.current) {
      startX.current = wrapperRef.current.getBoundingClientRect().x
    }
  }, [width])

  useEffect(() => {
    if (rangeSelecting) {
      rangeSelection.current = null
      player.setRange(null)
    }
  }, [rangeSelecting, player])

  function seekPlayer(e: { clientX: number }) {
    const progress = getProgress(e.clientX)
    const songTime = progress * player.getDuration()
    player.seek(songTime)
  }

  useEffect(() => {
    if (mousePressed) {
      const handleUp = () => {
        setMousePressed(false)
        if (rangeSelecting) {
          const { start, end } = rangeSelection.current!
          player.setRange({ start, end: end ?? 0 })
          setRangeSelecting(false)
        }
      }
      const handler = (e: MouseEvent) => {
        const progress = getProgress(e.clientX)
        const songTime = progress * player.getDuration()
        if (rangeSelecting) {
          rangeSelection.current = { start: rangeSelection.current?.start ?? 0, end: songTime }
        } else {
          player.seek(songTime)
        }
      }

      window.addEventListener('mousemove', handler)
      window.addEventListener('mouseup', handleUp)
      return () => {
        window.removeEventListener('mousemove', handler)
        window.removeEventListener('mouseup', handleUp)
      }
    }
  }, [mousePressed, rangeSelecting, player, getProgress, setRangeSelecting])

  return (
    <div
      ref={wrapperRef}
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        position: 'absolute',
        borderBottom: 'black solid 1px',
        boxSizing: 'border-box',
        userSelect: 'none',
      }}
      onMouseDown={(e) => {
        setMousePressed(true)
        if (!rangeSelecting) {
          seekPlayer(e)
          return
        }

        const progress = getProgress(e.clientX)
        const songTime = progress * player.getDuration()
        rangeSelection.current = { start: songTime, end: songTime }
      }}
      onMouseOver={() => setMouseOver(true)}
      onMouseOut={() => setMouseOver(false)}
      onMouseMove={(e: React.MouseEvent) => {
        if (measureSpanRef.current && timeSpanRef.current && toolTipRef.current) {
          const progress = getProgress(e.clientX)
          const songTime = progress * player.getDuration()
          const measure = player.getMeasureForTime(songTime)
          toolTipRef.current.style.left = `${Math.min(
            width - 150,
            e.clientX - startX.current + 10,
          )}px`
          measureSpanRef.current.innerText = String(measure?.number)
          timeSpanRef.current.innerText = formatTime(player.getRealTimeDuration(0, songTime))
        }
      }}
    >
      <div ref={measureRef} style={{ width: '100%', height: '100%', position: 'absolute' }} />
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            height: '100%',
            width,
            backgroundColor: '#B0B0B0',
          }}
        />
        <div
          style={{
            position: 'absolute',
            height: 'calc(100%)',
            width,
            pointerEvents: 'none',
            backgroundColor: 'white',
            left: -width,
          }}
          className="scrubBar"
          ref={divRef}
        />
      </div>
      <span
        ref={currentTimeRef}
        style={{ position: 'absolute', bottom: 1, left: 4, color: '#242632', fontSize: 20 }}
      ></span>
      <span style={{ position: 'absolute', bottom: 1, right: 4, color: '#242632', fontSize: 20 }}>
        {song && formatTime(player.getRealTimeDuration(0, song.duration))}
      </span>
      <div
        style={{
          display: mouseOver ? 'flex' : 'none',
          position: 'absolute',
          left: 100,
          top: -45,
          height: '42px',
          width: '150px',
          backgroundColor: 'black',
          zIndex: 6,
        }}
        ref={toolTipRef}
      >
        <span
          style={{
            position: 'absolute',
            top: 12,
            left: 7,
            color: 'white',
            verticalAlign: 'center',
            fontSize: 12,
          }}
        >
          Time: <span ref={timeSpanRef} style={{ color: 'green' }} />
        </span>
        <span
          style={{
            position: 'absolute',
            top: 12,
            right: 7,
            color: 'white',
            verticalAlign: 'center',
            fontSize: 12,
          }}
        >
          Measure: <span ref={measureSpanRef} style={{ color: 'green' }} />
        </span>
      </div>
      {rangeSelection.current && (
        <div
          ref={rangeRef}
          style={{
            position: 'absolute',
            border: '2px solid orange',
            top: '-2px',
            height: 30,
          }}
        ></div>
      )}
    </div>
  )
}

const trackColors = {
  right: {
    black: '#4912d4',
    white: '#7029fb',
  },
  left: {
    black: '#d74000',
    white: '#ff6825',
  },
  measure: '#C5C5C5', //'#C5C5C5',
}

function getTrackColor(songNote: SongNote, songConfig: SongConfig | undefined): string | void {
  const hand = songConfig?.tracks?.[songNote.track].hand
  if (hand && hand !== 'none') {
    const type = isBlack(songNote.midiNote) ? 'black' : 'white'
    return trackColors[hand][type]
  }
}

export default App
