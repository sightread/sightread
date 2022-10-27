import React, { PropsWithChildren } from 'react'
import { MouseEvent } from 'react'
import { BpmDisplay } from '@/features/SongInputControls'
import {
  ArrowLeftIcon,
  PreviousIcon,
  HistoryIcon,
  SoundOnIcon,
  SoundOffIcon,
  SettingsCog,
} from '@/icons'
import StatusIcon from './StatusIcon'
import clsx from 'clsx'

type TopBarProps = {
  isLoading: boolean
  isPlaying: boolean
  isSoundOff: boolean
  onTogglePlaying: () => void
  onClickSettings: (e: MouseEvent<any>) => void
  onClickBack: () => void
  onClickRestart: () => void
  onClickSound: () => void
  onSelectRange: () => void
  isSelectingRange: boolean
  sidebarOpen: boolean
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
  onSelectRange,
  isSelectingRange,
  sidebarOpen,
}: TopBarProps) {
  return (
    <div className="h-[50px] w-screen bg-[#292929] flex items-center justify-between z-10">
      <ButtonWithTooltip tooltip="Back">
        <ArrowLeftIcon height={40} width={50} onClick={onClickBack} />
      </ButtonWithTooltip>
      <div className="relative h-full gap-3 left-1/2 -translate-x-1/2 items-center flex justify-around">
        <VerticalDivider />
        <ButtonWithTooltip tooltip="Restart">
          <PreviousIcon height={40} width={40} onClick={onClickRestart} />
        </ButtonWithTooltip>

        <VerticalDivider />
        <StatusIcon isPlaying={isPlaying} isLoading={isLoading} onTogglePlaying={onTogglePlaying} />
        <VerticalDivider />
        <div className="hidden md:flex">
          <BpmDisplay />
          <VerticalDivider />
        </div>
      </div>
      <div className="flex ml-auto h-full items-center min-w-[150px] mr-[20px] gap-3">
        <VerticalDivider />
        <ButtonWithTooltip tooltip="Settings" isActive={sidebarOpen}>
          <SettingsCog width={25} height={25} onClick={onClickSettings} />
        </ButtonWithTooltip>
        <VerticalDivider />
        <ButtonWithTooltip tooltip="Loop" isActive={isSelectingRange}>
          <HistoryIcon width={25} height={25} onClick={onSelectRange} />
        </ButtonWithTooltip>
        <VerticalDivider />
        <ButtonWithTooltip className="" tooltip="Toggle volume" onClick={onClickSound}>
          {isSoundOff ? (
            <SoundOffIcon width={25} height={25} />
          ) : (
            <SoundOnIcon width={25} height={25} />
          )}
        </ButtonWithTooltip>
      </div>
    </div>
  )
}

function VerticalDivider() {
  return <hr className="w-[1px] h-3/4 bg-white border-none" />
}

type ButtonWithTooltipProps = PropsWithChildren<{
  tooltip: string
  tooltipPosition?: string
  onClick?: () => void
  className?: string
  isActive?: boolean
}>

export function ButtonWithTooltip(props: ButtonWithTooltipProps) {
  return (
    <span
      className="flex"
      data-tooltip={props.tooltip}
      data-tooltip-position={props.tooltipPosition ?? 'bottom'}
    >
      <button
        onClick={props.onClick}
        className={clsx(
          props.className,
          props.isActive ? 'fill-purple-primary text-purple-primary' : 'fill-white text-white',
          'hover:fill-purple-hover hover:text-purple-hover',
        )}
      >
        {props.children}
      </button>
    </span>
  )
}
