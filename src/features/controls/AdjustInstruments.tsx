import { Select } from '@/components'
import { Player, usePlayer } from '@/features/player'
import { getDefaultSongSettings } from '@/features/SongVisualization/utils.ts'
import { gmInstruments, InstrumentName } from '@/features/synth'
import { useOnUnmount } from '@/hooks'
import { LeftHand, Pause, Play, RefreshCcw, RightHand, Volume2, VolumeX } from '@/icons'
import { Song, SongConfig, TrackSetting } from '@/types'
import { formatInstrumentName } from '@/utils'
import clsx from 'clsx'
import { getDefaultStore, useAtomValue } from 'jotai'
import React, { useState } from 'react'

type InstrumentSettingsProps = {
  config: SongConfig
  song?: Song
  setTracks: (tracks: { [id: number]: TrackSetting }) => void
}

const miniPlayer = new Player(getDefaultStore())

export default function AdjustInstruments({ setTracks, config, song }: InstrumentSettingsProps) {
  useOnUnmount(() => miniPlayer.stop())
  const tracks = config.tracks
  const handleSetTrack = (trackId: number, track: TrackSetting) => {
    setTracks({ ...tracks, [trackId]: track })
    if (miniPlayer.isPlaying()) {
      miniPlayer.pause()
      miniPlayer.setTrackInstrument(trackId, track.instrument).then(() => miniPlayer.play())
    }
  }
  const [playingTrack, setPlayingTrack] = useState<number | null>(null)
  const miniPlayerState = useAtomValue(miniPlayer.state, { store: getDefaultStore() })
  const miniPlayerIsPlaying = miniPlayerState === 'Playing'

  async function playTrack(trackId: number) {
    if (!song) {
      return
    }
    const songConfig: SongConfig = { ...config }
    songConfig.waiting = false
    await miniPlayer.setSong(song, songConfig)
    setPlayingTrack(trackId)
    Object.keys(song.tracks).forEach((id) =>
      miniPlayer.setTrackVolume(+id, trackId === +id ? 1 : 0),
    )

    // jump to the first playable note so the sound starts immediately
    const firstNote = song.notes.find((note) => note.track === trackId)
    if (firstNote) {
      miniPlayer.seek(firstNote.time)
      miniPlayer.play()
    }
  }

  function stopMiniPlayer() {
    setPlayingTrack(null)
    miniPlayer.stop()
  }

  const handlePlayTrackChange = (trackId: number) => {
    const isPlaying = miniPlayerIsPlaying && playingTrack === trackId
    if (!isPlaying) {
      playTrack(trackId)
    } else {
      stopMiniPlayer()
    }
  }

  return (
    <>
      {Object.entries(tracks).map(([track, settings]) => {
        const isPlaying = miniPlayerIsPlaying && playingTrack === +track
        return (
          <InstrumentCard
            track={settings}
            trackId={+track}
            song={song}
            key={track}
            setTrack={handleSetTrack}
            noteCount={song?.notes.filter((n) => n.track === +track).length ?? 0}
            onPlayTrack={handlePlayTrackChange}
            isPlaying={isPlaying}
            stopPlayer={stopMiniPlayer}
          />
        )
      })}
    </>
  )
}

type CardProps = {
  track: TrackSetting
  song?: Song
  key: string
  trackId: number
  setTrack: (trackId: number, track: TrackSetting) => void
  noteCount: number
  onPlayTrack: (trackId: number) => void
  isPlaying: boolean
  stopPlayer: () => void
}
type SynthState = { error: boolean; loading: boolean }

function InstrumentCard({
  track,
  trackId,
  song,
  setTrack,
  noteCount,
  onPlayTrack,
  isPlaying,
  stopPlayer,
}: CardProps) {
  const [synthState, setSynthState] = useState<SynthState>({ error: false, loading: false })
  const player = usePlayer()

  const handlePlayTrack = (e: React.MouseEvent) => {
    e.preventDefault()
    onPlayTrack(trackId)
  }

  const handleRestoreTrack = () => {
    if (song) {
      stopPlayer()
      const defaultTrack = getDefaultSongSettings(song).tracks[trackId]
      if (defaultTrack) {
        setTrack(trackId, defaultTrack)
      }
    }
  }

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
    <span className="m-4 grow rounded-md border border-black bg-white px-3 sm:grow-0">
      <div className="flex items-center justify-center">
        <span style={{}}>
          Track {trackId + 1}
          {track.track.name ? ': ' + track.track.name : ''}
        </span>
        <span className="bg-purple-light mx-1 my-2 h-6 w-[2px]"></span>
        <span>{noteCount} Notes</span>
        <TogglePlayTrack on={isPlaying} onClick={handlePlayTrack} />
        <RestoreTrack onClick={handleRestoreTrack} />
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
      format={formatInstrumentName as any}
      display={formatInstrumentName as any}
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
  const handleSound = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleSound(!sound)
  }

  return (
    <div className="jusitfy-around flex items-center gap-4 p-4">
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
  onClick: (e: React.MouseEvent) => void
}

function ToggleLeftHand({ on, onClick }: ToggleIconProps) {
  return (
    <button className="flex flex-col items-center">
      <LeftHand
        height={32}
        width={32}
        fill={clsx(on ? 'fill-purple-primary' : 'fill-white hover:fill-purple-hover')}
        onClick={onClick}
      />
      <span style={labelStyle}>Left Hand</span>
    </button>
  )
}

function ToggleRightHand({ on, onClick }: ToggleIconProps) {
  return (
    <button className="flex flex-col items-center">
      <RightHand
        height={32}
        width={32}
        fill={clsx(on ? 'fill-purple-primary' : 'fill-white hover:fill-purple-hover')}
        onClick={onClick}
      />
      <span style={labelStyle}>Right Hand</span>
    </button>
  )
}

function ToggleSound({ on, onClick }: ToggleIconProps) {
  const Icon = on ? Volume2 : VolumeX
  const labelText = on ? 'Sound On' : 'Sound Off'

  return (
    <button className="flex flex-col items-center">
      <Icon
        height={32}
        width={32}
        className={clsx('transition', on && 'text-purple-primary')}
        onClick={onClick}
      />
      <span style={labelStyle}>{labelText}</span>
    </button>
  )
}

function TogglePlayTrack({ on, onClick }: ToggleIconProps) {
  const Icon = on ? Pause : Play
  return (
    <button
      className="mr-6 ml-2 flex flex-col items-center"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick(e)
      }}
    >
      <Icon
        height={24}
        width={24}
        className={clsx('hover:fill-purple-primary', on && 'fill-purple-primary')}
      />
    </button>
  )
}

function RestoreTrack({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
  return (
    <button className="ml-auto flex flex-col items-center">
      <RefreshCcw
        height={24}
        width={24}
        className={clsx('transition-transform duration-300 ease-in-out hover:-rotate-45')}
        onClick={onClick}
      />
    </button>
  )
}
