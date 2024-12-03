import { ButtonWithTooltip } from '@/app/play/components/TopBar'
import { Select } from '@/components'
import { gmInstruments, InstrumentName } from '@/features/synth'
import { ArrowLeft, Midi, StartRecord, StopRecord } from '@/icons'
import { formatInstrumentName } from '@/utils'
import Link from 'next/link'
import React, { MouseEvent } from 'react'
import { Maximize, Minimize } from 'react-feather'

type TopBarProps = {
  isError: boolean
  isLoading: boolean
  isRecordingAudio: boolean
  isFullScreen: boolean
  value: InstrumentName
  onChange: (instrument: InstrumentName) => void
  onClickMidi: (e: MouseEvent<any>) => void
  onClickRecord: (e: MouseEvent<any>) => void
  onClickFullScreen: () => void
}

export default function TopBar({
  isError,
  isLoading,
  isRecordingAudio,
  isFullScreen,
  value,
  onChange,
  onClickMidi,
  onClickRecord,
  onClickFullScreen,
}: TopBarProps) {
  const recordTooltip = isRecordingAudio ? 'Stop recording' : 'Start recording audio'

  return (
    <div className="flex h-[50px] min-h-[50px] w-full items-center gap-4 bg-[#292929] px-4 text-2xl text-white transition">
      <ButtonWithTooltip tooltip="Back">
        <Link href="/">
          <ArrowLeft size={24} />
        </Link>
      </ButtonWithTooltip>
      <ButtonWithTooltip tooltip={recordTooltip} className="ml-auto" onClick={onClickRecord}>
        {isRecordingAudio ? <StopRecord size={24} /> : <StartRecord size={24} />}
      </ButtonWithTooltip>
      <ButtonWithTooltip tooltip="Choose a MIDI device" onClick={onClickMidi}>
        <Midi size={24} />
      </ButtonWithTooltip>
      <Select
        className="h-3/4 max-w-fit text-base text-black"
        loading={isLoading}
        error={isError}
        value={value}
        onChange={onChange}
        options={gmInstruments as any}
        format={formatInstrumentName as any}
        display={formatInstrumentName as any}
      />
      <ButtonWithTooltip tooltip="Full Screen">
        {isFullScreen ?
          <Minimize size={24} onClick={onClickFullScreen} />:
          <Maximize size={24} onClick={onClickFullScreen} />}
      </ButtonWithTooltip>
    </div>
  )
}
