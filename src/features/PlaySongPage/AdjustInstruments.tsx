import React, { useState } from 'react'
import clsx from 'clsx'
import { css } from '@sightread/flake'
import { Select } from 'src/components'
import { LeftHandIcon, RightHandIcon, SoundOnIcon, SoundOffIcon } from 'src/icons'
import Player from 'src/player'
import { InstrumentName, gmInstruments } from 'src/synth/instruments'
import { SongConfig, TrackSetting } from 'src/types'
import { formatInstrumentName } from 'src/utils'
import { palette } from 'src/styles/common'

const classes = css({
  instrumentsHeader: {
    fontWeight: 600,
    fontSize: '16px',
  },
  instrumentCard: {
    width: '280px',
    backgroundColor: 'white',
    borderRadius: '6px',
    margin: '15px',
    border: '1px solid black',
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
      transition: 'fill 200ms',
    },
    cursor: 'pointer',
  },
  settingsIconActive: {
    '& path': {
      fill: palette.purple.primary,
    },
  },
})

type InstrumentSettingsProps = {
  config: SongConfig
  setTracks: (tracks: { [id: number]: TrackSetting }) => void
}

export function AdjustInstruments({ setTracks, config }: InstrumentSettingsProps) {
  const tracks = config.tracks
  const handleSetTrack = (trackId: number, track: TrackSetting) => {
    setTracks({ ...tracks, [trackId]: track })
  }

  return (
    <>
      {Object.entries(tracks).map(([track, settings]) => {
        return (
          <InstrumentCard
            track={settings}
            trackId={+track}
            key={track}
            setTrack={handleSetTrack}
            //  TODO: implement
            noteCount={0}
          />
        )
      })}
    </>
  )
}

type CardProps = {
  track: TrackSetting
  key: string
  trackId: number
  setTrack: (trackId: number, track: TrackSetting) => void
  noteCount: number
}
type SynthState = { error: boolean; loading: boolean }

function InstrumentCard({ track, trackId, setTrack, noteCount }: CardProps) {
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
        <span>{noteCount} Notes</span>
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

// TODO: iconInActive doesn't exist
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
