import { usePlayer } from '@/features/player'
import { ChevronDown, ChevronUp } from '@/icons'
import { round } from '@/utils'
import { useAtomValue } from 'jotai'

export default function BpmDisplay() {
  const player = usePlayer()
  const bpm = useAtomValue(player.getBpm())
  const bpmModifier = useAtomValue(player.getBpmModifier())
  const bpmText = round(bpm) + ' BPM'
  const percentText = round(bpmModifier * 100) + '%'

  const iconSize = 24
  return (
    <div className="mx-auto flex gap-2">
      <div className="flex flex-col">
        <span className="self-center text-center text-xl">{percentText}</span>
        <span className="text-center text-sm">{bpmText}</span>
      </div>
      <div className="flex flex-col justify-between">
        <ChevronUp
          size={iconSize}
          className="hover:text-purple-hover text-black hover:cursor-pointer"
          onClick={player.increaseBpm.bind(player)}
        />
        <ChevronDown
          size={iconSize}
          className="hover:text-purple-hover text-black hover:cursor-pointer"
          onClick={player.decreaseBpm.bind(player)}
        />
      </div>
    </div>
  )
}
