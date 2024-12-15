'use client'

import { Select } from '@/components'
import { Player, usePlayer } from '@/features/player'
import { gmInstruments, InstrumentName } from '@/features/synth'
import { LeftHand, Play, RightHand, Volume2, VolumeX } from '@/icons'
import { Song, SongConfig, TrackSetting } from '@/types'
import { formatInstrumentName } from '@/utils'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { createStore } from 'jotai'

type InstrumentSettingsProps = {
  config: SongConfig
  song?: Song
  setTracks: (tracks: { [id: number]: TrackSetting }) => void
}

const miniPlayer = new Player(createStore());

export default function AdjustInstruments({ setTracks, config, song }: InstrumentSettingsProps) {
  const tracks = config.tracks
  const handleSetTrack = (trackId: number, track: TrackSetting) => {
    setTracks({ ...tracks, [trackId]: track })
    if (miniPlayer.isPlaying()) {
      miniPlayer.pause()
      miniPlayer.setTrackInstrument(trackId, track.instrument).then(() => miniPlayer.play())
    }
  }
  const [playingTracks, setPlayingTracks] = useState<Set<number>>(new Set())

  const playTracks = async () => {
    if (!song)
      return
    const configCp: SongConfig = {...config}
    configCp.waiting = false
    await miniPlayer.setSong(song, configCp)
    enableTracks()
    // jump to the first playable note so the sound starts immediately
    const firstNote = song.notes.find((note) => playingTracks.has(note.track))
    if (firstNote) {
      miniPlayer.seek(firstNote.time)
      miniPlayer.play()
    }
  }

  const stopTracks = () => {
    miniPlayer.stop()
  }

  const enableTracks = () => {
    if (!song)
      return
    Object.keys(song.tracks).forEach((trackId) => miniPlayer.setTrackVolume(trackId, playingTracks.has(+trackId) ? 1 : 0))
  }

  useEffect(() => {
    if (playingTracks.size === 0) {
      if (miniPlayer.isPlaying()) {
        stopTracks()
      }
    } else {
      if (miniPlayer.isPlaying()) {
        enableTracks()
      } else {
        playTracks()
      }
    }
  }, [playingTracks])

  const handlePlayTrackChange = (trackId: number, isPlaying: boolean) => {
    if (isPlaying) {
      setPlayingTracks((prevPlayingTracks) => new Set(prevPlayingTracks).add(trackId));
    } else {
      setPlayingTracks((prevPlayingTracks) => {
        const newPlayingTracks = new Set(prevPlayingTracks)
        newPlayingTracks.delete(trackId);
        return newPlayingTracks;
      });
    }
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
            noteCount={song?.notes.filter((n) => n.track === +track).length ?? 0}
            onPlayTrack={handlePlayTrackChange}
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
  onPlayTrack: (trackId: number, isPlaying: boolean) => void
}
type SynthState = { error: boolean; loading: boolean }

function InstrumentCard({ track, trackId, setTrack, noteCount, onPlayTrack }: CardProps) {
  const [synthState, setSynthState] = useState<SynthState>({ error: false, loading: false })
  const player = usePlayer()
  const [isPlaying, setPlaying] = useState<boolean>(false)

  const handlePlayTrack = (isPlaying: boolean) => {
    setPlaying(isPlaying)
    onPlayTrack(trackId, isPlaying)
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
        playTrack={isPlaying}
        onSelectHand={handleSelectHand}
        onToggleSound={handleSound}
        onTogglePlayTrack={handlePlayTrack}
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
  playTrack: boolean
  onSelectHand: (hand: 'left' | 'right' | 'none') => void
  onToggleSound: (sound: boolean) => void
  onTogglePlayTrack: (playTrack: boolean) => void
}
function TrackSettingsSection({ hand, sound, playTrack, onSelectHand, onToggleSound, onTogglePlayTrack }: TrackSettingProps) {
  const handleSound = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleSound(!sound)
  }

  const handlePlayTrack = (e: React.MouseEvent) => {
    e.stopPropagation()
    onTogglePlayTrack(!playTrack)
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
      <TogglePlayTrack on={playTrack} onClick={handlePlayTrack} />
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
  const labelText = on ? 'Stop track' : 'Play track'

  return (
    <button className="flex flex-col items-center">
      <Play
        height={32}
        width={32}
        className={clsx(on ? 'text-purple-primary fill-purple-primary' : 'hover:fill-purple-primary')}
        onClick={onClick}
      />
      <span style={labelStyle}>{labelText}</span>
    </button>
  )
}
