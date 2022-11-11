import React, { MouseEvent } from 'react'
import { Select } from '@/components'
import { formatInstrumentName } from '@/utils'
import { gmInstruments, InstrumentName } from '@/features/synth'
import { ArrowLeft, Midi } from '@/icons'
import { useRouter } from 'next/router'
import { ButtonWithTooltip } from '../../PlaySong/components/TopBar'

type TopBarProps = {
  isError: boolean
  isLoading: boolean
  value: InstrumentName
  onChange: (instrument: InstrumentName) => void
  onClickMidi: (e: MouseEvent<any>) => void
}

export default function TopBar({ isError, isLoading, value, onChange, onClickMidi }: TopBarProps) {
  const router = useRouter()

  return (
    <div className="px-4 color-white transition text-2xl h-[50px] min-h-[50px] w-full bg-[#292929] flex items-center gap-4">
      <ButtonWithTooltip tooltip="Choose a MIDI device" onClick={() => router.back()}>
        <ArrowLeft size={24} />
      </ButtonWithTooltip>
      <ButtonWithTooltip tooltip="Choose a MIDI device" className="ml-auto" onClick={onClickMidi}>
        <Midi size={24} />
      </ButtonWithTooltip>
      <Select
        className="max-w-fit h-3/4 text-base"
        loading={isLoading}
        error={isError}
        value={value}
        onChange={onChange}
        options={gmInstruments as any}
        format={formatInstrumentName}
        display={formatInstrumentName}
      />
    </div>
  )
}
