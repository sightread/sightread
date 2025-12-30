import { ComboBox, ComboBoxItem } from '@/components/ComboBox'
import { gmInstruments, InstrumentName } from '@/features/synth'
import { ArrowLeft, Midi, StartRecord, StopRecord } from '@/icons'
import { ButtonWithTooltip } from '@/pages/play/components/TopBar'
import { formatInstrumentName } from '@/utils'
import React, { MouseEvent } from 'react'
import { Link } from 'react-router'

type TopBarProps = {
  isError: boolean
  isLoading: boolean
  isRecordingAudio: boolean
  value: InstrumentName
  onChange: (instrument: InstrumentName) => void
  onClickMidi: (e: MouseEvent<any>) => void
  onClickRecord: (e: MouseEvent<any>) => void
}

export default function TopBar({
  isError,
  isLoading,
  isRecordingAudio,
  value,
  onChange,
  onClickMidi,
  onClickRecord,
}: TopBarProps) {
  const recordTooltip = isRecordingAudio ? 'Stop recording' : 'Start recording audio'

  return (
    <div className="flex h-[50px] min-h-[50px] w-full items-center gap-4 bg-[#292929] px-4 text-2xl text-white transition">
      <ButtonWithTooltip tooltip="Back">
        <Link to="/">
          <ArrowLeft size={24} />
        </Link>
      </ButtonWithTooltip>
      <ButtonWithTooltip tooltip={recordTooltip} className="ml-auto" onClick={onClickRecord}>
        {isRecordingAudio ? <StopRecord size={24} /> : <StartRecord size={24} />}
      </ButtonWithTooltip>
      <ButtonWithTooltip tooltip="Choose a MIDI device" onClick={onClickMidi}>
        <Midi size={24} />
      </ButtonWithTooltip>
      <SelectInstrument isLoading={isLoading} isError={isError} value={value} onChange={onChange} />
    </div>
  )
}

function SelectInstrument(props: any) {
  return (
    <ComboBox
      className="h-3/4 max-w-fit text-base text-black"
      isLoading={props.isLoading}
      errorMessage={props.isError ? 'Error loading instruments' : undefined}
      selectedKey={props.value}
      menuTrigger="focus"
      onSelectionChange={props.onChange as any}
      onFocus={(event) => event.currentTarget.select()}
      items={gmInstruments.map((instrument) => ({
        id: instrument,
        name: formatInstrumentName(instrument),
      }))}
      aria-label="Select instrument"
    >
      {(item) => <ComboBoxItem>{item.name}</ComboBoxItem>}
    </ComboBox>
  )
}
