import React, { MouseEvent, useState } from 'react'
import { ArrowLeft, Midi, Volume2, VolumeX } from '@/icons'
import { useRouter } from 'next/router'
import { ButtonWithTooltip } from '@/features/pages/PlaySong/components/TopBar'
import Player from '@/features/player'
import Link from 'next/link'

type TopBarProps = {
  onClickMidi: (e: MouseEvent<any>) => void
}

export default function TopBar({ onClickMidi }: TopBarProps) {
  const router = useRouter()
  const player = Player.player()

  const isSoundOff = player.volume.value === 0
  const handleToggleSound = () => {
    if (!isSoundOff) {
      player.setVolume(0)
    } else {
      player.setVolume(1)
    }
  }

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
      <ButtonWithTooltip tooltip="Toggle volume" onClick={handleToggleSound}>
        {isSoundOff ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </ButtonWithTooltip>
    </div>
  )
}
