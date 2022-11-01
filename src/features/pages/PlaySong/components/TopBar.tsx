import React, { PropsWithChildren } from 'react'
import { MouseEvent } from 'react'
import { ArrowLeftIcon, PreviousIcon, SoundOnIcon, SoundOffIcon, SettingsCog } from '@/icons'
import StatusIcon from './StatusIcon'
import clsx from 'clsx'
import { Tooltip } from '@/components'

type TopBarProps = {
  isLoading: boolean
  isPlaying: boolean
  isSoundOff: boolean
  title?: string
  onTogglePlaying: () => void
  onClickSettings: (e: MouseEvent<any>) => void
  onClickBack: () => void
  onClickRestart: () => void
  onClickSound: () => void
  settingsOpen: boolean
}

export default function TopBar({
  isPlaying,
  isLoading,
  isSoundOff,
  onTogglePlaying,
  onClickSettings,
  onClickBack,
  onClickRestart,
  onClickSound,
  settingsOpen,
  title,
}: TopBarProps) {
  return (
    <div className="h-[50px] min-h-[50px] w-screen bg-[#292929] flex px-1 relative justify-center align-center gap-8 z-10">
      <ButtonWithTooltip
        tooltip="Back"
        className="!absolute left-3 top-1/2 -translate-y-1/2"
        style={{ transform: 'translateY(-50%)' }}
      >
        <ArrowLeftIcon height={40} width={50} onClick={onClickBack} />
      </ButtonWithTooltip>
      <div
        className={clsx(
          'flex h-full gap-8 items-center',
          'sm:absolute sm:left-1/2 sm:-translate-x-3/4',
        )}
      >
        <ButtonWithTooltip tooltip="Restart">
          <PreviousIcon height={24} width={24} onClick={onClickRestart} />
        </ButtonWithTooltip>
        <StatusIcon isPlaying={isPlaying} isLoading={isLoading} onTogglePlaying={onTogglePlaying} />
      </div>
      <div className="items-center hidden sm:flex sm:ml-auto h-full text-white">{title}</div>
      <div className="flex h-full items-center mr-[20px] gap-8">
        <ButtonWithTooltip tooltip="Settings" isActive={settingsOpen}>
          <SettingsCog width={24} height={24} onClick={onClickSettings} />
        </ButtonWithTooltip>
        <ButtonWithTooltip className="" tooltip="Toggle volume" onClick={onClickSound}>
          {isSoundOff ? (
            <SoundOffIcon width={24} height={24} />
          ) : (
            <SoundOnIcon width={24} height={24} />
          )}
        </ButtonWithTooltip>
      </div>
    </div>
  )
}

type ButtonWithTooltipProps = PropsWithChildren<{
  tooltip: string
  tooltipPosition?: string
  onClick?: () => void
  className?: string
  isActive?: boolean
  style?: React.CSSProperties
}>

export function ButtonWithTooltip(props: ButtonWithTooltipProps) {
  return (
    <Tooltip content={props.tooltip}>
      <button
        onClick={props.onClick}
        style={props.style}
        className={clsx(
          props.className,
          props.isActive ? 'fill-purple-primary text-purple-primary' : 'fill-white text-white',
          'hover:fill-purple-hover hover:text-purple-hover',
        )}
      >
        {props.children}
      </button>
    </Tooltip>
  )
}
