import { useRef } from 'react'
import Player from '@/features/player'
import { useRAFLoop } from '@/hooks'
import { ArrowUp, ArrowDown } from '@/icons'
import { Sizer } from '@/components'

export default function BpmDisplay() {
  const bpmRef = useRef<HTMLSpanElement>(null)
  const percentRef = useRef<HTMLSpanElement>(null)
  const player = Player.player()

  useRAFLoop(() => {
    if (bpmRef.current) {
      bpmRef.current.textContent = Math.floor(player.getBpm()) + ' BPM'
    }
    if (percentRef.current) {
      percentRef.current.textContent = Math.floor(player.getBpmModifier() * 100) + '%'
    }
  })
  const iconSize = 24

  return (
    <div className="flex mx-auto gap-4">
      <div className="flex flex-col">
        <span className="text-xl text-center self-center" ref={percentRef} />
        <span className="text-sm text-center" ref={bpmRef} />
      </div>
      <div className="flex flex-col justify-between">
        <ArrowUp
          height={iconSize}
          width={iconSize}
          className="fill-black hover:cursor-pointer hover:fill-purple-hover"
          onClick={player.increaseBpm.bind(player)}
        />
        <ArrowDown
          height={iconSize}
          width={iconSize}
          className="fill-black hover:cursor-pointer hover:fill-purple-hover"
          onClick={player.decreaseBpm.bind(player)}
        />
      </div>
    </div>
  )
}
