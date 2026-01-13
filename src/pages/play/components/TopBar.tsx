import { Tooltip } from '@/components'
import { ArrowLeft, BarChart2, KeyboardMusic, Settings } from '@/icons'
import clsx from 'clsx'
import React, { MouseEvent, PropsWithChildren } from 'react'
import { Button, TooltipTrigger } from 'react-aria-components'

type TopBarProps = {
  title?: string
  subtitle?: string
  onClickBack: () => void
  onClickMidi: (e: MouseEvent<any>) => void
  onClickStats: (e: MouseEvent<any>) => void
  statsVisible: boolean
  isSettingsOpen: boolean
  onToggleSettings: () => void
}

export default function TopBar({
  onClickBack,
  title,
  subtitle,
  onClickMidi,
  statsVisible,
  onClickStats,
  isSettingsOpen,
  onToggleSettings,
}: TopBarProps) {
  return (
    <div className="relative z-10 h-14 w-screen border-b border-[#20222a] bg-[#15161b] px-4">
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center gap-3">
          <ButtonWithTooltip tooltip="Back" onClick={onClickBack}>
            <ArrowLeft size={24} />
          </ButtonWithTooltip>
          <div className="flex flex-col">
            {title && (
              <span
                className="max-w-[320px] truncate text-sm font-semibold text-white"
                title={title}
              >
                {title}
              </span>
            )}
            {subtitle && (
              <span className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                {subtitle}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <ButtonWithTooltip
            tooltip={statsVisible ? 'Hide Stats' : 'Show Stats'}
            isActive={statsVisible}
            onClick={onClickStats}
          >
            <BarChart2 size={20} />
          </ButtonWithTooltip>
          <ButtonWithTooltip tooltip="Choose a MIDI device" onClick={onClickMidi}>
            <KeyboardMusic size={24} />
          </ButtonWithTooltip>
          <ButtonWithTooltip
            tooltip="Settings"
            isActive={isSettingsOpen}
            onClick={onToggleSettings}
          >
            <Settings size={24} />
          </ButtonWithTooltip>
        </div>
      </div>
    </div>
  )
}

type ButtonWithTooltipProps = PropsWithChildren<
  React.ComponentProps<typeof Button> & { tooltip: string; isActive?: boolean }
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
      <Button
        {...rest}
        aria-label={rest['aria-label'] ?? tooltip}
        aria-pressed={typeof isActive === 'boolean' ? isActive : undefined}
        className={clsx(
          className,
          isActive ? 'fill-purple-primary text-purple-primary' : 'fill-white text-white',
          'hover:fill-purple-hover hover:text-purple-hover',
        )}
      >
        {children}
      </Button>
      <Tooltip> {tooltip} </Tooltip>
    </TooltipTrigger>
  )
}
