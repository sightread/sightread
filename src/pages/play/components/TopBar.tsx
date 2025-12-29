import { Popover, Tooltip } from '@/components'
import { VolumeSliderButton } from '@/features/controls'
import { ArrowLeft, BarChart2, Midi, Settings, SkipBack } from '@/icons'
import { isMobile } from '@/utils'
import clsx from 'clsx'
import React, { MouseEvent, PropsWithChildren } from 'react'
import { Dialog, DialogTrigger, Pressable, TooltipTrigger } from 'react-aria-components'
import SettingsPanel from './SettingsPanel'
import StatusIcon from './StatusIcon'

type TopBarProps = {
  isLoading: boolean
  isPlaying: boolean
  title?: string
  onTogglePlaying: () => void
  onClickBack: () => void
  onClickRestart: () => void
  onClickMidi: (e: MouseEvent<any>) => void
  onClickStats: (e: MouseEvent<any>) => void
  statsVisible: boolean
  settingsProps: any
}

export default function TopBar({
  isPlaying,
  isLoading,
  onTogglePlaying,
  onClickBack,
  onClickRestart,
  title,
  onClickMidi,
  settingsProps,
  statsVisible,
  onClickStats,
}: TopBarProps) {
  return (
    <div className="align-center relative z-10 h-[50px] min-h-[50px] w-screen bg-[#292929] px-3">
      <div className="grid h-full grid-cols-[1fr_auto_1fr] items-center">
        <div className="flex items-center justify-start">
          <ButtonWithTooltip tooltip="Back">
            <ArrowLeft size={24} onClick={onClickBack} />
          </ButtonWithTooltip>
        </div>
        <div className="flex items-center justify-center gap-6">
          <ButtonWithTooltip tooltip="Restart">
            <SkipBack size={24} onClick={onClickRestart} />
          </ButtonWithTooltip>
          <StatusIcon
            isPlaying={isPlaying}
            isLoading={isLoading}
            onTogglePlaying={onTogglePlaying}
          />
        </div>
        <div className="flex items-center justify-end gap-6">
          {title && (
            <span
              className="hidden max-w-[min(30vw,320px)] truncate text-white md:block"
              title={title}
            >
              {title}
            </span>
          )}
          <ButtonWithTooltip tooltip="Choose a MIDI device">
            <Midi size={24} onClick={onClickMidi} />
          </ButtonWithTooltip>
          <DialogTrigger>
            <ButtonWithTooltip tooltip="Settings">
              <Settings size={24} />
            </ButtonWithTooltip>
            <Popover containerPadding={0} className={'w-screen border-0'}>
              <Dialog>
                <SettingsPanel {...settingsProps} />
              </Dialog>
            </Popover>
          </DialogTrigger>
          {!isMobile() && <VolumeSliderButton />}
          {
            <ButtonWithTooltip tooltip={statsVisible ? 'Hide Stats' : 'Show Stats'}>
              <BarChart2
                onClick={onClickStats}
                size={24}
                className={statsVisible ? 'text-white' : 'text-gray-400'}
              />
            </ButtonWithTooltip>
          }
        </div>
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
    <TooltipTrigger delay={0}>
      <Pressable>
        <button
          {...rest}
          role="button"
          className={clsx(
            className,
            isActive ? 'fill-purple-primary text-purple-primary' : 'fill-white text-white',
            'hover:fill-purple-hover hover:text-purple-hover',
          )}
        >
          {children}
        </button>
      </Pressable>
      <Tooltip> {tooltip} </Tooltip>
    </TooltipTrigger>
  )
}
