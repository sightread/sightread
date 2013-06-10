import { useRef } from 'react'
import Player from '@/features/player'
import { useRAFLoop } from '@/hooks'
import { MinusIcon, PlusIcon } from '@/icons'
import { ButtonWithTooltip } from '../pages/PlaySong/components/TopBar'

export default function BpmDisplay() {
  const bpmRef = useRef<HTMLSpanElement>(null)
  const percentRef = useRef<HTMLSpanElement>(null)
  const player = Player.player()

  useRAFLoop(() => {
    if (!bpmRef.current || !percentRef.current) {
      return
    }

    bpmRef.current.textContent = Math.floor(player.getBpm()) + ' BPM'
    percentRef.current.textContent = Math.floor(player.getBpmModifier() * 100) + '%'
  })

  return (
    <div className="flex gap-1 items-center justify-between select-none">
      <ButtonWithTooltip tooltip="Decrease BPM" onClick={() => player.decreaseBpm()}>
        <MinusIcon height={25} width={25} />
      </ButtonWithTooltip>
      <div className="flex flex-col text-white text-center">
        <span className="text-xl" ref={percentRef} />
        <span className="text-xs" ref={bpmRef} />
      </div>
      <ButtonWithTooltip tooltip="Increase BPM" onClick={() => player.increaseBpm()}>
        <PlusIcon height={25} width={25} />
      </ButtonWithTooltip>
    </div>
  )
}
