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
    <div className="h-[50px] w-screen bg-[#292929] flex z-10 px-1 relative justify-center align-center">
      <ButtonWithTooltip tooltip="Back" className="!absolute left-3 top-1/2 -translate-y-1/2">
        <ArrowLeftIcon height={40} width={50} onClick={onClickBack} />
      </ButtonWithTooltip>
      <div
        className={clsx(
          'h-full gap-3 items-center flex',
          'md:absolute md:left-1/2 md:-translate-x-1/2',
        )}
      >
        <VerticalDivider className="hidden md:flex" />
        <ButtonWithTooltip tooltip="Restart">
          <PreviousIcon height={40} width={40} onClick={onClickRestart} />
        </ButtonWithTooltip>
        <VerticalDivider />
        <StatusIcon isPlaying={isPlaying} isLoading={isLoading} onTogglePlaying={onTogglePlaying} />
        <VerticalDivider />
        <div className="hidden md:flex">
          <BpmDisplay />
        </div>
        <VerticalDivider className="hidden md:flex" />
      </div>
      <div className="flex md:ml-auto h-full items-center mr-[20px] gap-3">
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

function VerticalDivider({ className }: { className?: string }) {
  return <hr className={clsx(className, 'w-[1px] h-3/4 bg-white border-none')} />
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
    <button
      onClick={props.onClick}
      data-tooltip={props.tooltip}
      data-tooltip-position={props.tooltipPosition ?? 'bottom'}
      className={clsx(
        props.className,
        props.isActive ? 'fill-purple-primary text-purple-primary' : 'fill-white text-white',
        'hover:fill-purple-hover hover:text-purple-hover',
      )}
    >
      {props.children}
    </button>
  )
}
