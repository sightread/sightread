import { Popover, Slider, Tooltip } from '@/components'
import { useSongScrubTimes } from '@/features/controls'
import { usePlayer } from '@/features/player'
import { Check, Gauge, Hourglass, Metronome, Pause, Play, Repeat, SkipBack, Volume2 } from '@/icons'
import { round } from '@/utils'
import clsx from 'clsx'
import { useAtomValue } from 'jotai'
import React from 'react'
import { Button, Menu, MenuItem, MenuTrigger, TooltipTrigger } from 'react-aria-components'
import { getSpeedPresetOptions } from './speedPresets'

type TransportBarProps = {
  isPlaying: boolean
  isLoading: boolean
  onTogglePlaying: () => void
  onClickRestart: () => void
  isLooping: boolean
  onToggleLoop: () => void
  isWaiting: boolean
  onToggleWaiting: () => void
  isMetronomeOn: boolean
  onToggleMetronome: () => void
}

export default function TransportBar({
  isPlaying,
  isLoading,
  onTogglePlaying,
  onClickRestart,
  isLooping,
  onToggleLoop,
  isWaiting,
  onToggleWaiting,
  isMetronomeOn,
  onToggleMetronome,
}: TransportBarProps) {
  const player = usePlayer()
  const { currentTime, duration } = useSongScrubTimes()
  const bpmModifier = useAtomValue(player.getBpmModifier())
  const volume = useAtomValue(player.volume)
  const measure = player.getMeasureForTime(player.getTime())?.number ?? 1
  const isBpmModified = Math.abs(bpmModifier - 1) > 0.001

  const speedOptions = getSpeedPresetOptions(bpmModifier)

  return (
    <div className="flex h-12 items-center justify-between border-t border-[#23242b] bg-[#141419] px-4 text-gray-200">
      <div className="flex items-center gap-3">
        <Button
          className="text-gray-400 transition hover:text-white"
          onPress={onClickRestart}
          onMouseDown={(event) => event.preventDefault()}
        >
          <SkipBack className="h-5 w-5" />
        </Button>
        <Button
          className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.35)] transition hover:bg-violet-500 active:scale-95"
          onPress={onTogglePlaying}
          onMouseDown={(event) => event.preventDefault()}
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
          ) : isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>
        <div className="flex items-center gap-2 pl-2">
          <Volume2 className="h-4 w-4 text-gray-400" />
          <div className="w-24">
            <Slider
              orientation="horizontal"
              min={0}
              max={1}
              step={0.01}
              value={[volume]}
              onValueChange={(val) => player.setVolume(val[0])}
              className="h-2 w-full"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end select-none">
          <div className="flex items-baseline gap-1 font-mono select-none">
            <span className="text-sm font-semibold text-white select-none">{currentTime}</span>
            <span className="text-[11px] text-gray-500 select-none">/ {duration}</span>
          </div>
          <span className="text-[10px] font-semibold tracking-wider text-violet-400 uppercase select-none">
            Measure {measure}
          </span>
        </div>
        <div className="hidden h-6 w-px bg-[#2a2b32] md:block" />
        <div className="hidden items-center gap-2 md:flex">
          <TogglePill
            isActive={isMetronomeOn}
            label="Metronome"
            icon={<Metronome />}
            onPress={onToggleMetronome}
          />
          <TogglePill
            isActive={isWaiting}
            label="Wait mode"
            icon={<Hourglass />}
            content="Wait"
            onPress={onToggleWaiting}
          />
          <MenuTrigger>
            <TooltipTrigger>
              <Button
                className={clsx(
                  'flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-medium transition',
                  isBpmModified
                    ? 'border-violet-500/30 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20'
                    : 'border-transparent bg-[#1e2028] text-gray-300 hover:bg-[#232633]',
                )}
              >
                <Gauge
                  className={
                    isBpmModified ? 'h-3.5 w-3.5 text-violet-200' : 'h-3.5 w-3.5 text-gray-400'
                  }
                />
                {round(bpmModifier * 100)}%
              </Button>
              <Tooltip>Playback speed</Tooltip>
            </TooltipTrigger>
            <Popover placement="bottom" className="min-w-[96px] p-0.5 text-sm">
              <Menu
                className="outline-none"
                onAction={(key) => {
                  const option = speedOptions.find((entry) => entry.id === key)
                  if (!option) {
                    return
                  }
                  player.setBpmModifier(option.value)
                }}
              >
                {speedOptions.map((option) => {
                  const isSelected = Math.abs(option.value - bpmModifier) < 0.001
                  return (
                    <MenuItem
                      id={option.id}
                      key={option.id}
                      className={clsx(
                        'flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-200 transition outline-none',
                        'data-[focused]:bg-zinc-700 data-[pressed]:bg-zinc-700',
                        isSelected && 'bg-zinc-800 text-white',
                      )}
                    >
                      {option.label}
                      {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                    </MenuItem>
                  )
                })}
              </Menu>
            </Popover>
          </MenuTrigger>
        </div>
        <div className="h-6 w-px bg-[#2a2b32]" />
        <TogglePill
          isActive={isLooping}
          label="Loop"
          icon={<Repeat />}
          content="Loop"
          onPress={onToggleLoop}
        />
      </div>
    </div>
  )
}

type TogglePillProps = {
  isActive: boolean
  label: string
  icon: React.ReactElement<{ className: string }>
  content?: React.ReactNode
  onPress: () => void
}

function TogglePill({ isActive, label, icon, content, onPress }: TogglePillProps) {
  const iconClasses = isActive ? 'h-3.5 w-3.5 text-violet-200' : 'h-3.5 w-3.5 text-gray-400'
  const styledIcon = React.cloneElement(icon, { className: iconClasses })
  return (
    <TooltipTrigger>
      <Button
        className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition ${
          isActive
            ? 'border border-violet-500/30 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20'
            : 'border border-transparent bg-[#1e2028] text-gray-300 hover:bg-[#232633]'
        }`}
        onPress={onPress}
        onMouseDown={(event) => event.preventDefault()}
      >
        {styledIcon}
        {content ? (
          <span className="min-w-7 text-center">{content}</span>
        ) : (
          <span className="relative inline-flex min-w-7 justify-center">
            <span className="invisible">OFF</span>
            <span
              className={clsx(
                'absolute inset-0 flex items-center justify-center transition-opacity',
                isActive ? 'opacity-100' : 'opacity-0',
              )}
            >
              ON
            </span>
            <span
              className={clsx(
                'absolute inset-0 flex items-center justify-center transition-opacity',
                isActive ? 'opacity-0' : 'opacity-100',
              )}
            >
              OFF
            </span>
          </span>
        )}
      </Button>
      <Tooltip>{label}</Tooltip>
    </TooltipTrigger>
  )
}
