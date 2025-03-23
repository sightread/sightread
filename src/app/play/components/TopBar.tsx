import { Tooltip } from '@/components'
import { VolumeSliderButton } from '@/features/controls'
import { ArrowLeft, Midi, Settings, SkipBack } from '@/icons'
import { isMobile } from '@/utils'
import clsx from 'clsx'
import React, { MouseEvent, PropsWithChildren } from 'react'
import StatusIcon from './StatusIcon'

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
    <div className="align-center relative z-10 flex h-[50px] min-h-[50px] w-screen justify-center gap-8 bg-[#292929] px-1">
      <ButtonWithTooltip
        tooltip="Back"
        className="absolute! left-3 top-1/2 -translate-y-1/2"
        style={{ transform: 'translateY(-50%)' }}
      >
        <ArrowLeft size={24} onClick={onClickBack} />
      </ButtonWithTooltip>
      <div
        className={clsx(
          'flex h-full items-center gap-8',
          'sm:absolute sm:left-1/2 sm:-translate-x-3/4',
        )}
      >
        <ButtonWithTooltip tooltip="Restart">
          <SkipBack size={24} onClick={onClickRestart} />
        </ButtonWithTooltip>
        <StatusIcon isPlaying={isPlaying} isLoading={isLoading} onTogglePlaying={onTogglePlaying} />
      </div>
      <div className="hidden h-full items-center text-white sm:ml-auto sm:flex">{title}</div>
      <div className="mr-[20px] flex h-full items-center gap-8">
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
          isActive ? 'fill-purple-primary text-purple-primary' : 'fill-white text-white',
          'hover:fill-purple-hover hover:text-purple-hover',
        )}
      >
        {children}
      </button>
    </Tooltip>
  )
}
