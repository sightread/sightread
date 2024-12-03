import { Tooltip } from '@/components'
import { VolumeSliderButton } from '@/features/controls'
import { ArrowLeft, Midi, Settings, SkipBack } from '@/icons'
import { isMobile } from '@/utils'
import clsx from 'clsx'
import React, { MouseEvent, PropsWithChildren, useEffect, useState } from 'react'
import StatusIcon from './StatusIcon'
import { ChevronsUp, Maximize, Menu, Minimize } from 'react-feather'
import useWindowWidth from '@/hooks/useWindowWidth';

type TopBarProps = {
  isLoading: boolean
  isPlaying: boolean
  isFullScreen: boolean
  title?: string
  onTogglePlaying: () => void
  onClickSettings: (e: MouseEvent<any>) => void
  onClickBack: () => void
  onClickRestart: () => void
  onClickMidi: (e: MouseEvent<any>) => void
  onClickFullScreen: () => void
  onClickHide: () => void
  settingsOpen: boolean
}

export default function TopBar({
  isPlaying,
  isLoading,
  isFullScreen,
  onTogglePlaying,
  onClickSettings,
  onClickBack,
  onClickRestart,
  onClickFullScreen,
  onClickHide,
  settingsOpen,
  title,
  onClickMidi,
}: TopBarProps) {
  const [showMore, setShowMore] = useState<boolean>(false)
  const windowWidth = useWindowWidth();
  useEffect(() => {
    setShowMore(false);
  }, [windowWidth]);

  return (
    <div className="align-center relative z-10 flex h-[50px] min-h-[50px] w-screen justify-end gap-8 bg-[#292929] px-1">
      <ButtonWithTooltip
        tooltip="Back"
        className="!absolute left-3 top-1/2 -translate-y-1/2"
        style={{ transform: 'translateY(-50%)' }}
      >
        <ArrowLeft size={24} onClick={onClickBack} />
      </ButtonWithTooltip>
      <div
        className={clsx(
          'flex h-full items-center gap-8',
          'left-16 absolute',
          'lg:absolute lg:left-1/2 lg:-translate-x-3/4',
        )}
      >
        <ButtonWithTooltip tooltip="Restart">
          <SkipBack size={24} onClick={onClickRestart} />
        </ButtonWithTooltip>
        <StatusIcon isPlaying={isPlaying} isLoading={isLoading} onTogglePlaying={onTogglePlaying} />
      </div>
      <div className="hidden w-1/4 lg:w-1/5 h-full items-center text-white sm:ml-auto sm:flex">
        <div className="overflow-hidden whitespace-nowrap overflow-ellipsis">{title}</div>
      </div>
      <ButtonWithTooltip tooltip={"menu"} className="mr-3 min-h-[50px] xs:hidden absolute" isActive={showMore}>
        <Menu size={24} onClick={() => setShowMore(!showMore)} />
      </ButtonWithTooltip>
      <div className={(showMore ? "flex flex-col mt-[50px] p-2 mr-1 h-fit bg-[#292929]": "hidden mr-[20px] h-full" ) + " xs:flex items-center gap-8"}>
        <ButtonWithTooltip tooltip="Choose a MIDI device">
          <Midi size={24} onClick={onClickMidi} />
        </ButtonWithTooltip>
        <ButtonWithTooltip tooltip="Settings" isActive={settingsOpen}>
          <Settings size={24} onClick={onClickSettings} />
        </ButtonWithTooltip>
        {!isMobile() && <VolumeSliderButton />}
        <ButtonWithTooltip tooltip="Full Screen">
          {isFullScreen ?
            <Minimize size={24} onClick={onClickFullScreen} />:
            <Maximize size={24} onClick={onClickFullScreen} />}
        </ButtonWithTooltip>
        <ButtonWithTooltip tooltip="Hide Menu">
          <ChevronsUp size={24} onClick={onClickHide} />
        </ButtonWithTooltip>
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
