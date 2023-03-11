import React, { MouseEvent } from 'react'
import { ArrowLeft, Midi } from '@/icons'
import { ButtonWithTooltip } from '@/features/pages/PlaySong/components/TopBar'
import Link from 'next/link'
import { isMobile } from '@/utils'
import { VolumeSliderButton } from '@/features/controls'

type TopBarProps = {
  onClickMidi: (e: MouseEvent<any>) => void
}

export default function TopBar({ onClickMidi }: TopBarProps) {
  return (
    <div className="px-8 text-white transition text-2xl h-[50px] min-h-[50px] w-full bg-[#292929] flex items-center gap-4">
      <ButtonWithTooltip tooltip="Back">
        <Link href="/">
          <ArrowLeft size={24} />
        </Link>
      </ButtonWithTooltip>
      <span className="absolute left-1/2 -translate-x-1/2">Training</span>
      <ButtonWithTooltip tooltip="Choose a MIDI device" className="ml-auto" onClick={onClickMidi}>
        <Midi size={24} />
      </ButtonWithTooltip>
      {!isMobile() && <VolumeSliderButton />}
    </div>
  )
}
