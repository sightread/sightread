import { Slider } from '@/components'
import Toggle from '@/components/Toggle'
import { usePlayer } from '@/features/player'
import { ChevronDown, ChevronUp } from '@/icons'
import clsx from 'clsx'
import { useAtom } from 'jotai'

const MULTIPLIERS = [0.25, 0.5, 1, 2, 4]
const fractionDisplay = (val: number) => (val < 1 ? `1/${1 / val}×` : `${val}×`)
const iconSize = 24

export default function MetronomeSettings() {
  const player = usePlayer()
  const [emphasizeFirst, setEmphasizeFirst] = useAtom(player.metronomeEmphasizeFirst)
  const [metronomeSpeed, setMetronomeSpeed] = useAtom(player.metronomeSpeed)
  const [volume, setVolume] = useAtom(player.metronomeVolume)

  const speedIndex = MULTIPLIERS.findIndex((m) => m === metronomeSpeed)
  const isDisabled = volume === 0

  return (
    <div className="flex flex-col gap-2">
      <div className="flex w-full items-center">
        <span className="mr-4 whitespace-nowrap text-gray-700">Volume</span>
        <div className="flex-1">
          <Slider
            orientation="horizontal"
            min={0}
            max={1}
            step={0.01}
            value={[volume]}
            onValueChange={(val) => setVolume(val[0])}
            onClick={(e) => e.stopPropagation()}
            className="h-2 w-full"
          />
        </div>
      </div>

      <div
        className={clsx(
          'flex w-full items-center justify-between',
          isDisabled && 'pointer-events-none opacity-50',
        )}
      >
        <span>Speed</span>
        <div className="flex flex-col items-center justify-between">
          <ChevronUp
            size={iconSize}
            className="hover:text-purple-hover cursor-pointer text-black"
            onClick={() =>
              setMetronomeSpeed(MULTIPLIERS[Math.min(speedIndex + 1, MULTIPLIERS.length - 1)])
            }
          />
          <span className="text-sm">{fractionDisplay(metronomeSpeed)}</span>
          <ChevronDown
            size={iconSize}
            className="hover:text-purple-hover cursor-pointer text-black"
            onClick={() => setMetronomeSpeed(MULTIPLIERS[Math.max(speedIndex - 1, 0)])}
          />
        </div>
      </div>

      <div
        className={clsx(
          'flex w-full items-center justify-between',
          isDisabled && 'pointer-events-none opacity-50',
        )}
      >
        <span>Emphasize 1st Beat</span>
        <Toggle checked={emphasizeFirst} onChange={setEmphasizeFirst} />
      </div>
    </div>
  )
}
