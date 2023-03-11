import React, { PropsWithChildren } from 'react'
import { ArrowLeft, SkipBack, Settings, Midi } from '@/icons'
import { MouseEvent } from 'react'
import StatusIcon from './StatusIcon'
import clsx from 'clsx'
import { Slider, Tooltip } from '@/components'
import { Dropdown } from '@/components'
import Player from '@/features/player'
import { isMobile } from '@/utils'
import { VolumeSliderButton } from '@/features/controls'

type TopBarProps = {
  isLoading: boolean
  isPlaying: boolean
  title?: string
  onTogglePlaying: () => void
  onClickSettings: (e: MouseEvent<any>) => void
  onClickBack: () => void
  onClickRestart: () => void
  onClickMidi: (e: MouseEvent<any>) => void
  settingsOpen: boolean
}

export default function TopBar({
  isPlaying,
  isLoading,
  onTogglePlaying,
  onClickSettings,
  onClickBack,
  onClickRestart,
  settingsOpen,
  title,
  onClickMidi,
}: TopBarProps) {
  return (
    <div className="h-[50px] min-h-[50px] w-screen bg-[#292929] flex px-1 relative justify-center align-center gap-8 z-10">
      <ButtonWithTooltip
        tooltip="Back"
        className="!absolute left-3 top-1/2 -translate-y-1/2"
        style={{ transform: 'translateY(-50%)' }}
      >
        <ArrowLeft size={24} onClick={onClickBack} />
      </ButtonWithTooltip>
      <div
        className={clsx(
          'flex h-full gap-8 items-center',
          'sm:absolute sm:left-1/2 sm:-translate-x-3/4',
        )}
      >
        <ButtonWithTooltip tooltip="Restart">
          <SkipBack size={24} onClick={onClickRestart} />
        </ButtonWithTooltip>
        <StatusIcon isPlaying={isPlaying} isLoading={isLoading} onTogglePlaying={onTogglePlaying} />
      </div>
      <div className="items-center hidden sm:flex sm:ml-auto h-full text-white">{title}</div>
      <div className="flex h-full items-center mr-[20px] gap-8">
        <ButtonWithTooltip tooltip="Choose a MIDI device">
          <Midi size={24} onClick={onClickMidi} />
        </ButtonWithTooltip>
        <ButtonWithTooltip tooltip="Settings" isActive={settingsOpen}>
          <Settings size={24} onClick={onClickSettings} />
        </ButtonWithTooltip>
        {!isMobile() && <VolumeSliderButton />}
      </div>
    </div>
  )
}

type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>
type ButtonWithTooltipProps = PropsWithChildren<
  ButtonProps & { tooltip: string; isActive?: boolean }
>

export function ButtonWithTooltip({
  tooltip,
  children,
  isActive,
  className,
  ...rest
}: ButtonWithTooltipProps) {
  return (
    <Tooltip label={tooltip}>
      <button
        {...rest}
        className={clsx(
          className,
          isActive ? 'text-purple-primary fill-purple-primary' : 'text-white fill-white',
          'hover:text-purple-hover hover:fill-purple-hover',
        )}
      >
        {children}
      </button>
    </Tooltip>
  )
}
