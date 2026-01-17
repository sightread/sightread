import { Select, Tooltip } from '@/components'
import { SelectItem } from '@/components/Select'
import { PickInstrument } from '@/features/controls'
import { Player, usePlayer } from '@/features/player'
import { HAND_COLORS } from '@/features/SongVisualization/handColors'
import { getDefaultSongSettings } from '@/features/SongVisualization/utils'
import { InstrumentName } from '@/features/synth'
import { getKeySignatures, KEY_SIGNATURE, NOTE_LABELS } from '@/features/theory'
import { useOnUnmount } from '@/hooks'
import { Metronome as MetronomeIcon } from '@/icons'
import { Song, SongConfig, VisualizationMode } from '@/types'
import clsx from 'clsx'
import { getDefaultStore, useAtomValue } from 'jotai'
import {
  AudioWaveform,
  ChevronDown,
  Gauge,
  Hand,
  Hourglass,
  Key,
  ListMusic,
  Monitor,
  Pause,
  Play,
  Repeat,
  SlidersHorizontal,
  Timer,
  Type,
  X,
} from 'lucide-react'
import { PropsWithChildren, useMemo, useState } from 'react'
import { Switch as AriaSwitch, TooltipTrigger } from 'react-aria-components'
import { getSpeedPresetOptions, SPEED_PRESETS } from './speedPresets'

type SidebarProps = {
  onChange: (settings: SongConfig) => void
  config: SongConfig
  song?: Song
  onClose?: () => void
  isLooping: boolean
  onLoopToggled: (b: boolean) => void
}

const METRONOME_PRESETS = [0.25, 0.5, 1, 2, 4]
const TRANSPOSE_OPTIONS = Array.from({ length: 25 }, (_, index) => index - 12).map((value) => ({
  id: value.toString(),
  name: value === 0 ? '0' : value > 0 ? `+${value}` : value.toString(),
}))

const miniPlayer = new Player(getDefaultStore())

export default function SettingsPanel(props: SidebarProps) {
  const { left, right, visualization, waiting, noteLabels, coloredNotes, keySignature, transpose } =
    props.config
  const { onClose, onLoopToggled, isLooping } = props
  const player = usePlayer()
  const bpmModifier = useAtomValue(player.getBpmModifier())
  const bpm = useAtomValue(player.getBpm())
  const [playingTrack, setPlayingTrack] = useState<number | null>(null)
  const miniPlayerState = useAtomValue(miniPlayer.state, { store: getDefaultStore() })
  const miniPlayerIsPlaying = miniPlayerState === 'Playing' || miniPlayerState === 'CountingDown'

  const defaultSongSettings = getDefaultSongSettings(props.song)
  const metronomeConfig = props.config.metronome ?? defaultSongSettings.metronome
  const countdownSeconds = props.config.countdownSeconds ?? defaultSongSettings.countdownSeconds
  const metronomeEnabled = metronomeConfig.enabled
  const metronomeVolume = metronomeConfig.volume
  const metronomeSpeed = metronomeConfig.speed
  const emphasizeFirst = metronomeConfig.emphasizeFirst

  useOnUnmount(() => miniPlayer.stop())

  const presetValue =
    SPEED_PRESETS.find((value) => Math.abs(bpmModifier - value) < 0.001) ?? bpmModifier
  const metronomePresetValue =
    METRONOME_PRESETS.find((value) => Math.abs(metronomeSpeed - value) < 0.001) ?? 'custom'
  const trackCount = useMemo(() => {
    if (props.song?.tracks) {
      return Object.keys(props.song.tracks).length
    }
    return Object.keys(props.config.tracks ?? {}).length
  }, [props.song, props.config.tracks])
  const trackEntries = useMemo(() => {
    return Object.entries(props.config.tracks)
      .map(([id, track]) => ({ id: Number(id), track }))
      .sort((a, b) => a.id - b.id)
  }, [props.config.tracks])
  const handsMode = left && right ? 'both' : left ? 'left' : 'right'
  const speedPresetItems = getSpeedPresetOptions(bpmModifier).map((option) => ({
    id: option.id,
    name: option.label,
  }))
  const metronomePresetItems = [
    ...METRONOME_PRESETS.map((value) => ({
      id: value.toString(),
      name: value === 0.25 ? '1/4×' : value === 0.5 ? '1/2×' : `${value}×`,
    })),
    ...(metronomePresetValue === 'custom'
      ? [{ id: metronomeSpeed.toString(), name: `${metronomeSpeed}×` }]
      : []),
  ]

  const handleHand = (selected: 'left' | 'right') => {
    if (selected === 'left') {
      props.onChange({ ...props.config, left: !props.config.left })
    }
    if (selected === 'right') {
      props.onChange({ ...props.config, right: !props.config.right })
    }
  }

  const setHands = (mode: 'both' | 'left' | 'right') => {
    if (mode === 'both') {
      props.onChange({ ...props.config, left: true, right: true })
    } else if (mode === 'left') {
      props.onChange({ ...props.config, left: true, right: false })
    } else {
      props.onChange({ ...props.config, left: false, right: true })
    }
  }

  const handleVisualization = (visualization: VisualizationMode) => {
    props.onChange({ ...props.config, visualization })
  }

  const handleWaiting = (waiting: boolean) => {
    props.onChange({ ...props.config, waiting })
  }

  const handleNoteLabels = (noteLabels: NOTE_LABELS) => {
    props.onChange({ ...props.config, noteLabels })
  }

  const handleColoredNotes = () => {
    props.onChange({ ...props.config, coloredNotes: !coloredNotes })
  }

  const handleKeySignature = (keySignature: KEY_SIGNATURE) => {
    props.onChange({ ...props.config, keySignature })
  }

  const toggleMetronome = (next: boolean) => {
    const nextVolume = metronomeConfig.volume
    props.onChange({
      ...props.config,
      metronome: {
        ...metronomeConfig,
        enabled: next,
        volume: next ? nextVolume : metronomeConfig.volume,
      },
    })
  }

  const resetToDefaults = () => {
    props.onChange(getDefaultSongSettings(props.song))
  }

  const updateTrack = (trackId: number, track: SongConfig['tracks'][number]) => {
    props.onChange({
      ...props.config,
      tracks: { ...props.config.tracks, [trackId]: track },
    })
  }

  const handleSelectHand = (trackId: number, hand: 'left' | 'right' | 'none') => {
    const current = props.config.tracks[trackId]
    if (!current) {
      return
    }
    updateTrack(trackId, { ...current, hand: current.hand === hand ? 'none' : hand })
  }

  const handleSelectInstrument = (trackId: number, instrument: InstrumentName) => {
    const current = props.config.tracks[trackId]
    if (!current) {
      return
    }
    player.setTrackInstrument(trackId, instrument)
    updateTrack(trackId, { ...current, instrument })
  }

  const playTrack = async (trackId: number) => {
    if (!props.song) {
      return
    }
    const songConfig: SongConfig = { ...props.config, waiting: false }
    await miniPlayer.setSong(props.song, songConfig)
    setPlayingTrack(trackId)
    Object.keys(props.song.tracks).forEach((id) =>
      miniPlayer.setTrackVolume(+id, trackId === +id ? 1 : 0),
    )
    const firstNote = props.song.notes.find((note) => note.track === trackId)
    if (firstNote) {
      miniPlayer.seek(firstNote.time)
      miniPlayer.play()
    }
  }

  const stopMiniPlayer = () => {
    setPlayingTrack(null)
    miniPlayer.stop()
  }

  const handlePlayTrackChange = (trackId: number) => {
    const isPlaying = miniPlayerIsPlaying && playingTrack === trackId
    if (isPlaying) {
      stopMiniPlayer()
    } else {
      playTrack(trackId)
    }
  }

  return (
    <div className="flex h-full w-full flex-col text-white">
      <div className="flex items-center justify-between border-b border-[#2b2a33] px-4 py-3">
        <h2 className="text-base font-semibold tracking-tight">Settings</h2>
        <button
          type="button"
          className="flex size-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-white/10 hover:text-white"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto pt-0">
        <Section title="Playback" icon={<AudioWaveform className="h-4 w-4 text-violet-300" />}>
          <SettingRow
            icon={<Gauge className="h-4 w-4" />}
            title="Speed"
            subtitle={`BPM ${Math.round(bpm)}`}
          >
            <div className="flex items-center gap-2">
              <Select
                aria-label="Speed preset"
                className="w-16"
                size="sm"
                selectedKey={presetValue.toString()}
                onSelectionChange={(key) => {
                  player.setBpmModifier(Number(key))
                }}
                items={speedPresetItems}
              >
                {(item) => <SelectItem>{item.name}</SelectItem>}
              </Select>
            </div>
          </SettingRow>

          <SettingRow
            icon={<Repeat className="h-4 w-4" />}
            title="Loop Section"
            subtitle="Repeat selected bars"
          >
            <SidebarSwitch isSelected={isLooping} onChange={onLoopToggled} />
          </SettingRow>

          <SettingRow
            icon={<Hourglass className="h-4 w-4" />}
            title="Wait Mode"
            subtitle="Pause until correct note"
          >
            <SidebarSwitch isSelected={waiting} onChange={handleWaiting} />
          </SettingRow>

          <div className="space-y-4">
            <SettingRow
              icon={<MetronomeIcon className="h-4 w-4" />}
              title="Metronome"
              subtitle="Keep time while playing"
            >
              <SidebarSwitch isSelected={metronomeEnabled} onChange={toggleMetronome} />
            </SettingRow>
            {metronomeEnabled && (
              <div className="ml-2 space-y-4 border-l border-[#2b2a33] pl-9">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-white">Volume</label>
                  <SegmentedToggle
                    className="w-[140px]"
                    value={
                      metronomeVolume >= 0.85 ? 'high' : metronomeVolume >= 0.6 ? 'med' : 'low'
                    }
                    onChange={(id) => {
                      const nextVolume = id === 'high' ? 0.85 : id === 'med' ? 0.6 : 0.3
                      props.onChange({
                        ...props.config,
                        metronome: { ...metronomeConfig, volume: nextVolume },
                      })
                    }}
                    options={[
                      { id: 'low', label: 'low' },
                      { id: 'med', label: 'med' },
                      { id: 'high', label: 'high' },
                    ]}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-white">Speed</label>
                  <Select
                    aria-label="Metronome speed"
                    className="w-auto"
                    size="sm"
                    selectedKey={
                      metronomePresetValue === 'custom'
                        ? metronomeSpeed.toString()
                        : metronomePresetValue.toString()
                    }
                    onSelectionChange={(key) => {
                      if (key === 'custom') {
                        return
                      }
                      props.onChange({
                        ...props.config,
                        metronome: { ...metronomeConfig, speed: Number(key) },
                      })
                    }}
                    items={metronomePresetItems}
                  >
                    {(item) => <SelectItem>{item.name}</SelectItem>}
                  </Select>
                </div>
                <SettingRow title="Emphasize first beat" titleClassName="text-[11px] font-medium">
                  <SidebarSwitch
                    size="sm"
                    isSelected={emphasizeFirst}
                    onChange={(value) =>
                      props.onChange({
                        ...props.config,
                        metronome: { ...metronomeConfig, emphasizeFirst: value },
                      })
                    }
                  />
                </SettingRow>
              </div>
            )}
          </div>

          <SettingRow
            icon={<Hand className="h-4 w-4" />}
            title="Hands"
            subtitle="Select active hands"
          >
            <SegmentedToggle
              className="w-[126px]"
              value={handsMode}
              onChange={(value) => setHands(value as typeof handsMode)}
              options={[
                { id: 'both', label: 'both' },
                { id: 'left', label: 'left' },
                { id: 'right', label: 'right' },
              ]}
            />
          </SettingRow>

          <SettingRow
            icon={<Timer className="h-4 w-4" />}
            title="Countdown"
            subtitle="Begin with a countdown"
          >
            <SegmentedToggle
              className="w-[126px]"
              value={countdownSeconds <= 0 ? 'off' : countdownSeconds === 5 ? '5' : '3'}
              onChange={(id) => {
                const next = id === '5' ? 5 : id === '3' ? 3 : 0
                props.onChange({ ...props.config, countdownSeconds: next })
              }}
              options={[
                { id: 'off', label: 'Off' },
                { id: '3', label: '3s' },
                { id: '5', label: '5s' },
              ]}
            />
          </SettingRow>

          <SettingRow
            icon={<Key className="h-4 w-4" />}
            title="Transpose"
            subtitle="Shift semitones"
          >
            <Select
              aria-label="Transpose"
              className="w-16"
              size="sm"
              selectedKey={(transpose ?? 0).toString()}
              onSelectionChange={(key) => {
                props.onChange({ ...props.config, transpose: Number(key) })
              }}
              items={TRANSPOSE_OPTIONS}
            >
              {(item) => <SelectItem>{item.name}</SelectItem>}
            </Select>
          </SettingRow>
        </Section>

        <Section title="Display" icon={<SlidersHorizontal className="h-4 w-4 text-violet-300" />}>
          <SettingRow icon={<Monitor className="h-4 w-4" />} title="Visualizer">
            <Select
              aria-label="Visualizer"
              className="w-32"
              size="md"
              selectedKey={visualization}
              onSelectionChange={(key) => handleVisualization(key as VisualizationMode)}
              items={[
                { id: 'falling-notes', name: 'Falling notes' },
                { id: 'sheet', name: 'Sheet hero (beta)' },
              ]}
            >
              {(item) => <SelectItem>{item.name}</SelectItem>}
            </Select>
          </SettingRow>
          {visualization === 'sheet' && (
            <div className="ml-2 flex flex-col gap-3 border-l border-[#2b2a33] pl-9">
              <SettingRow title="Colored notes" subtitle="Identify notes easier">
                <SidebarSwitch isSelected={coloredNotes} onChange={handleColoredNotes} />
              </SettingRow>
              <SettingRow title="Key signature" subtitle="Affects sharps/flats display">
                <Select
                  aria-label="Key signature"
                  className="w-16"
                  size="sm"
                  selectedKey={keySignature ?? props.song?.keySignature}
                  onSelectionChange={(key) => handleKeySignature(key as KEY_SIGNATURE)}
                  items={getKeySignatures().map((keySig) => ({ id: keySig, name: keySig }))}
                >
                  {(item) => <SelectItem>{item.name}</SelectItem>}
                </Select>
              </SettingRow>
            </div>
          )}
          <SettingRow icon={<Type className="h-4 w-4" />} title="Note labels">
            <Select
              aria-label="Note labels"
              className="w-32"
              size="md"
              selectedKey={noteLabels}
              onSelectionChange={(key) => handleNoteLabels(key as NOTE_LABELS)}
              items={[
                { id: 'none', name: 'None' },
                { id: 'alphabetical', name: 'Alphabetical' },
                { id: 'fixed-do', name: 'Fixed Do' },
              ]}
            >
              {(item) => <SelectItem>{item.name}</SelectItem>}
            </Select>
          </SettingRow>
        </Section>

        <Section
          title="Tracks"
          icon={<ListMusic className="h-4 w-4 text-violet-300" />}
          badge={
            <span className="rounded-full border border-[#322e3b] bg-[#262030] px-2 py-0.5 text-[10px] text-gray-500">
              {trackCount}
            </span>
          }
        >
          <div>
            <div className="space-y-2">
              {trackEntries.map((entry, index) => {
                const noteCount =
                  props.song?.notes.filter((note) => note.track === entry.id).length ?? 0
                const isPlaying = miniPlayerIsPlaying && playingTrack === entry.id
                return (
                  <div
                    key={entry.id}
                    className={clsx(
                      'group/track rounded-md border border-transparent bg-[#1f1e26] p-3 transition-all hover:border-[#3a3444]',
                      entry.track.sound === false && 'opacity-75 hover:opacity-100',
                    )}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-5 items-center justify-center rounded-full bg-[#8b5cf6]/15 text-[10px] font-bold text-[#8b5cf6]">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-white">Track {index + 1}</span>
                        <button
                          type="button"
                          className="ml-1 flex items-center justify-center text-gray-500 hover:text-[#8b5cf6]"
                          title="Sample Sound"
                          onClick={() => handlePlayTrackChange(entry.id)}
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </button>
                        <span className="ml-1 text-[10px] font-medium text-gray-500">
                          {noteCount.toLocaleString()} notes
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex rounded-md bg-black/40 p-0.5">
                          <button
                            type="button"
                            className={clsx(
                              'rounded px-2 py-1 text-[10px] font-semibold text-gray-500 transition-all',
                              entry.track.hand === 'left' && 'text-white',
                            )}
                            style={
                              entry.track.hand === 'left'
                                ? { backgroundColor: HAND_COLORS.left.white }
                                : undefined
                            }
                            onClick={() => handleSelectHand(entry.id, 'left')}
                          >
                            LH
                          </button>
                          <button
                            type="button"
                            className={clsx(
                              'rounded px-2 py-1 text-[10px] font-semibold text-gray-500 transition-all',
                              entry.track.hand === 'right' && 'text-white',
                            )}
                            style={
                              entry.track.hand === 'right'
                                ? { backgroundColor: HAND_COLORS.right.white }
                                : undefined
                            }
                            onClick={() => handleSelectHand(entry.id, 'right')}
                          >
                            RH
                          </button>
                        </div>
                      </div>
                    </div>
                    <PickInstrument
                      className="w-full"
                      value={entry.track.instrument}
                      onChange={(instrument) => handleSelectInstrument(entry.id, instrument)}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </Section>
      </div>
      <div className="border-t border-[#2b2a33] bg-[#191720] px-4 py-3">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-md bg-[#2d2638] px-3 py-2 text-xs font-semibold text-gray-200 transition hover:bg-[#3a3347]"
          onClick={resetToDefaults}
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  )
}

type SectionProps = PropsWithChildren<{
  title: string
  icon: React.ReactNode
  defaultOpen?: boolean
  badge?: React.ReactNode
}>

function Section({ children, title, icon, defaultOpen = false, badge }: SectionProps) {
  return (
    <details
      className="group overflow-hidden border-t border-[#2b2a33] first:border-t-0"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer items-center justify-between px-5 py-3 transition hover:bg-white/5">
        <div className="flex items-center gap-3">
          {icon}
          <span className="text-sm font-semibold text-gray-100">{title}</span>
          {badge}
        </div>
        <ChevronDown className="h-4 w-4 text-gray-500 transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-5 px-5 py-4">{children}</div>
    </details>
  )
}

type SettingRowProps = PropsWithChildren<{
  icon?: React.ReactNode
  title: string
  subtitle?: string
  titleClassName?: string
}>

function SettingRow({ icon, title, subtitle, titleClassName, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex size-8 items-center justify-center rounded-lg bg-[#322e3b] text-gray-300">
            {icon}
          </div>
        )}
        <div className="flex flex-col">
          <span className={clsx('text-sm font-medium text-white', titleClassName)}>{title}</span>
          {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

type SidebarSwitchProps = {
  isSelected: boolean
  onChange: (value: boolean) => void
  size?: 'sm' | 'md'
}

function SidebarSwitch({ isSelected, onChange, size = 'md' }: SidebarSwitchProps) {
  const trackClass = size === 'sm' ? 'h-5 w-9' : 'h-6 w-11'
  const thumbClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
  const translateClass = size === 'sm' ? 'translate-x-4' : 'translate-x-5'

  return (
    <AriaSwitch isSelected={isSelected} onChange={onChange} className="group inline-flex">
      {({ isSelected }) => (
        <div
          className={clsx(
            'relative inline-flex items-center rounded-full border border-transparent transition',
            trackClass,
            isSelected ? 'bg-violet-500' : 'bg-[#322e3b]',
          )}
        >
          <span
            className={clsx(
              'absolute left-1 rounded-full bg-white transition-transform',
              thumbClass,
              isSelected && translateClass,
            )}
          />
        </div>
      )}
    </AriaSwitch>
  )
}

type SegmentedOption = {
  id: string
  label: string
}

type SegmentedToggleProps = {
  value: string
  options: SegmentedOption[]
  onChange: (id: string) => void
  className?: string
}

function SegmentedToggle({ value, options, onChange, className }: SegmentedToggleProps) {
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.id === value),
  )
  const indicatorWidth = `${100 / options.length}%`

  return (
    <div
      className={clsx(
        'relative flex rounded-md bg-black/30 p-0.5 text-[10px] font-semibold text-gray-500 uppercase',
        className,
      )}
    >
      <div
        className="absolute inset-y-0 left-0 rounded-md bg-violet-600 transition-transform duration-200"
        style={{
          width: indicatorWidth,
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />
      {options.map((option) => {
        const isActive = option.id === value
        return (
          <button
            key={option.id}
            type="button"
            className={clsx(
              'relative z-10 flex-1 rounded px-2 py-1 transition-colors',
              isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300',
            )}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
