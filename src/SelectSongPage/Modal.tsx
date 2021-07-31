import * as React from 'react'
import { useRef, useState, useEffect } from 'react'
import { PlayableSong, TrackSetting, TrackSettings } from '../types'
import { useSelectedSong, cachedSettings } from '../hooks'
import { PianoRoll, SongVisualizer } from '../PlaySongPage'
import { getHandSettings, applySettings, getTrackSettings } from '../PlaySongPage/utils'
import { SongScrubBar } from '../pages/play/[...song_location]'
import { getSong, inferHands, Sizer, formatInstrumentName } from '../utils'
import Player from '../player'
import Select from '../components/Select'
import { gmInstruments, InstrumentName } from '../synth/instruments'
import {
  BothHandsIcon,
  ClockIcon,
  MusicalNoteIcon,
  DoubleArrowLoopIcon,
  CancelCircleIcon,
  LeftHandIcon,
  RightHandIcon,
  SoundOnIcon,
  SoundOffIcon,
  PlayIcon,
  LoadingIcon,
} from '../icons'
import { css } from '@sightread/flake'
import { useRouter } from 'next/router'
import clsx from 'clsx'

const palette = {
  purple: {
    light: '#EDEBF6',
    primary: '#7029FA',
    dark: '#3e0ca0',
  },
}

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
  instrumentsButtonActive: {
    color: palette.purple.primary,
  },
  instrumentsBtnWrapper: {
    width: '55%',
    transition: '150ms',
    height: 40,
  },
  instrumentsBtnWrapperActive: {
    backgroundColor: '#EAEAEA',
    height: '56px',
    borderRadius: '5px 5px 0px 0px',
    margin: 0,
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
  instrumentsContainer: {
    margin: '0px -32px',
    backgroundColor: 'rgb(236 236 236)',
    padding: '32px',
    // these widths are so that the adjust instruments container
    // is the correct size on the responsive layout.
    '@media screen and (min-width: 1130px)': {
      width: '164%',
    },
    '@media screen and (max-width: 1129px)': {
      width: '100%',
    },
    '@media screen and (min-width: 800px)': {
      maxWidth: 'calc(100vw - 152px)',
    },
  },
  instrumentsHeader: {
    fontWeight: 600,
    fontSize: '16px',
  },
  instrumentCard: {
    width: '280px',
    backgroundColor: 'white',
    borderRadius: '6px',
    margin: '15px',
  },
  cardLabelDivider: {
    width: 2,
    height: 24,
    backgroundColor: palette.purple.light,
    margin: '4px 8px',
  },
  instrumentSelect: {
    borderRadius: 0,
    width: '100%',
    border: 'none',
    height: '50px',
    backgroundColor: palette.purple.light,
    fontWeight: 'bold',
    fontSize: '16px',
  },
  selectIcon: {
    top: 18,
    right: 15,
  },
  instrumentMenu: {
    top: 30,
  },
  settingsIcon: {
    '& path': {
      transition: '200ms',
    },
    cursor: 'pointer',
  },
  settingsIconActive: {
    '& path': {
      fill: palette.purple.primary,
    },
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
function Modal({ show = true, onClose = () => {}, songMeta = undefined } = {}) {
  const { file, name, artist } = (songMeta as any) || {}
  const modalRef = useRef<HTMLDivElement>(null)
  // songSettings is context api for lifting state,
  // but still keeping song + trackSettings for local configuration.
  // then will use setSongSettings before moving to the play song page
  const [_, setSongSettings] = useSelectedSong(file) // TODO: cache the song as well?
  const [song, setSong] = useState<PlayableSong | null>(null)
  // if tracks exits on songSettings, then it was  read from localStorage cache
  const [trackSetings, setTrackSettings] = useState<TrackSettings | null>(null)
  const [playing, setPlaying] = useState(false)
  const [canPlay, setCanPlay] = useState(false)
  const [showInstruments, setShowInstruments] = useState(false)
  const router = useRouter()
  const player = Player.player()

  function setupModal(song: PlayableSong) {
    setCanPlay(false)
    setSong(song)
    const cachedTrackSettings = cachedSettings(file)
    if (cachedTrackSettings) {
      setTrackSettings(cachedTrackSettings)
      // setting the song track program which is used by player to know which synths to init
      Object.entries(cachedTrackSettings).forEach(([trackId, settings]) => {
        song.tracks[+trackId].program = gmInstruments.indexOf(settings.instrument)
      })
    } else {
      setTrackSettings(getTrackSettings(song))
    }
    player.setSong(song).then(() => {
      setCanPlay(true)
      if (cachedTrackSettings) {
        applySettings(player, cachedTrackSettings)
      }
    })
  }

  useEffect(() => {
    if (!songMeta || !(songMeta as any).file) {
      return
    }
    getSong(`${(songMeta as any).file}`)
      .then((song) => inferHands(song, file.includes('lesson')))
      .then((song: PlayableSong) => {
        setupModal(song)
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
    if (!song || !trackSetings) {
      console.error('Both song and track settings are required.')
      return
    }

    setSongSettings(file, { song, tracks: trackSetings })
    router.push(`/play/${file}`)
  }

  const handleShowInstruments = () => {
    setShowInstruments(!showInstruments)
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
                handSettings={getHandSettings(trackSetings)}
                hand="both"
                visualization="falling-notes"
                getTime={() => Player.player().getTime()}
              />
            </div>
            <Sizer height={16} />
            <div className={classes.buttonContainer}>
              <button className={classes.playNowButton} onClick={handlePlayNow}>
                Play Now
              </button>
              <AdjustInstrumentsButton active={showInstruments} onClick={handleShowInstruments} />
            </div>
            <AdjustInstruments
              show={showInstruments}
              tracks={trackSetings}
              setTracks={setTrackSettings}
            />
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

type InstrumentSettingsProps = {
  tracks: TrackSettings | null
  setTracks: Function
  show: boolean
}

function AdjustInstruments({ tracks, setTracks, show }: InstrumentSettingsProps) {
  if (!show) {
    return <Sizer height={35} />
  }

  const handleSetTrack = (trackId: number, newTrack: TrackSetting) => {
    setTracks({ ...tracks, [trackId]: newTrack })
  }

  return (
    <div className={classes.instrumentsContainer}>
      <h4 className={classes.instrumentsHeader}>
        Select the track and assign a hand you want to play per track.
      </h4>
      <Sizer height={24} />
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {!!tracks &&
          Object.entries(tracks).map(([track, settings]) => {
            return (
              <InstrumentCard
                track={settings}
                trackId={+track}
                key={track}
                setTrack={handleSetTrack}
              />
            )
          })}
      </div>
    </div>
  )
}

type CardProps = {
  track: TrackSetting
  key: string
  trackId: number
  setTrack: (trackId: number, newTrack: TrackSetting) => void
}
type SynthState = { error: boolean; loading: boolean }

function InstrumentCard({ track, trackId, setTrack }: CardProps) {
  const [synthState, setSynthState] = useState<SynthState>({ error: false, loading: false })
  const player = Player.player()

  const handleSelectInstrument = (instrument: InstrumentName) => {
    setSynthState({ error: false, loading: true })
    player
      .setTrackInstrument(trackId, instrument)
      .then(() => {
        setSynthState({ error: false, loading: false })
        setTrack(trackId, { ...track, instrument })
      })
      .catch(() => {
        setSynthState({ error: true, loading: false })
      })
    // setTrack(trackId, { count, hand, track: instrument, sound })
  }
  const handleSelectHand = (hand: 'left' | 'right' | 'none') => {
    if (track.hand === hand) {
      hand = 'none'
    }
    setTrack(trackId, { ...track, hand })
  }
  const handleSound = (sound: boolean) => {
    player.setTrackVolume(trackId, sound ? 1.0 : 0)
    setTrack(trackId, { ...track, sound })
  }
  return (
    <span className={classes.instrumentCard}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <span style={{}}>Track {trackId + 1}</span>
        <span className={classes.cardLabelDivider}></span>
        <span>{track.count} Notes</span>
      </div>
      <InstrumentSelect
        value={track.instrument}
        onSelect={handleSelectInstrument}
        error={synthState.error}
        loading={synthState.loading}
      />
      <TrackSettingsSection
        hand={track.hand}
        sound={track.sound}
        onSelectHand={handleSelectHand}
        onToggleSound={handleSound}
      />
    </span>
  )
}

function InstrumentSelect({
  value,
  error,
  loading,
  onSelect,
}: {
  value: string
  error: boolean
  loading: boolean
  onSelect: (val: any) => void
}) {
  return (
    <Select
      error={error}
      loading={loading}
      value={value}
      onChange={onSelect}
      options={gmInstruments as any}
      classNames={{
        select: classes.instrumentSelect,
        icon: classes.selectIcon,
        menu: classes.instrumentMenu,
      }}
      format={formatInstrumentName}
      display={formatInstrumentName}
    />
  )
}

type TrackSettingProps = {
  hand: 'left' | 'right' | 'none'
  sound: boolean
  onSelectHand: (hand: 'left' | 'right' | 'none') => void
  onToggleSound: (sound: boolean) => void
}
function TrackSettingsSection({ hand, sound, onSelectHand, onToggleSound }: TrackSettingProps) {
  const handleSound = () => {
    onToggleSound(!sound)
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '15px 10px',
      }}
    >
      <ToggleLeftHand
        on={hand === 'left'}
        onClick={() => {
          onSelectHand('left')
        }}
      />
      <ToggleRightHand
        on={hand === 'right'}
        onClick={() => {
          onSelectHand('right')
        }}
      />
      <ToggleSound on={sound} onClick={handleSound} />
    </div>
  )
}

const labelStyle = {
  fontSize: '14px',
  paddingTop: '8px',
}

type ToggleIconProps = {
  on: boolean
  onClick: () => void
}

function ToggleLeftHand({ on, onClick }: ToggleIconProps) {
  return (
    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <LeftHandIcon
        height={32}
        width={32}
        className={clsx(
          classes.settingsIcon,
          on ? classes.settingsIconActive : classes.iconInActive,
        )}
        onClick={onClick}
      />
      <span style={labelStyle}>Left Hand</span>
    </span>
  )
}

function ToggleRightHand({ on, onClick }: ToggleIconProps) {
  return (
    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <RightHandIcon
        height={32}
        width={32}
        className={clsx(
          classes.settingsIcon,
          on ? classes.settingsIconActive : classes.iconInActive,
        )}
        onClick={onClick}
      />
      <span style={labelStyle}>Right Hand</span>
    </span>
  )
}

function ToggleSound({ on, onClick }: ToggleIconProps) {
  return (
    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {on ? (
        <>
          <SoundOnIcon
            height={32}
            width={32}
            className={clsx(
              classes.settingsIcon,
              on ? classes.settingsIconActive : classes.iconInActive,
            )}
            onClick={onClick}
          />
          <span style={labelStyle}>Sound On</span>
        </>
      ) : (
        <>
          <SoundOffIcon
            height={32}
            width={32}
            className={clsx(
              classes.settingsIcon,
              on ? classes.settingsIconActive : classes.iconInActive,
            )}
            onClick={onClick}
          />
          <span style={labelStyle}>Sound Off</span>
        </>
      )}
    </span>
  )
}

function AdjustInstrumentsButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <span
      className={clsx(classes.instrumentsBtnWrapper, {
        [classes.instrumentsBtnWrapperActive]: active,
      })}
    >
      <button
        className={clsx(
          classes.baseButton,
          active ? classes.instrumentsButtonActive : classes.instrumentsButton,
        )}
        onClick={onClick}
      >
        <span
          style={
            (active && {
              fontWeight: 'bold',
              borderBottom: `3px solid ${palette.purple.primary}`,
            }) ||
            {}
          }
        >
          Adjust Instruments
        </span>
      </button>
    </span>
  )
}
