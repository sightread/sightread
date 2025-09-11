import MovablePopup from '@/components/MovablePopup'
import { usePlayer } from '@/features/player'
import { BarChart2 } from '@/icons'
import { useAtomValue } from 'jotai'

export function StatsPopup({}) {
  const player = usePlayer()

  const accuracy = useAtomValue(player.score.accuracy)
  const streak = useAtomValue(player.score.streak)
  const perfect = useAtomValue(player.score.perfect)
  const good = useAtomValue(player.score.good)
  const missed = useAtomValue(player.score.missed)
  const error = useAtomValue(player.score.error)

  return (
    <MovablePopup
      initialPosition={{ x: '100%', y: 90 }}
      header={
        <div className="flex h-[40px] w-full cursor-grab items-center gap-2">
          <div className="flex items-center gap-1">
            <BarChart2 className="h-5 w-5 text-white" />
            <span className="font-semibold text-white">Session Stats</span>
          </div>
          <span className="ml-auto w-16 text-right font-semibold text-white">{accuracy}%</span>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-center rounded-lg bg-slate-500/40 px-4 py-2">
          <span className="mr-2 text-sm font-bold text-white">STREAK</span>
          <span className="text-2xl font-bold text-white">{streak}</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div className="flex flex-col items-center rounded-lg bg-black/40 px-4 py-3">
            <span className="text-sm font-bold text-green-400">PERFECT</span>
            <span className="text-2xl font-bold text-green-400">{perfect}</span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-black/40 px-4 py-3">
            <span className="text-sm font-bold text-blue-400">GOOD</span>
            <span className="text-2xl font-bold text-blue-400">{good}</span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-black/40 px-4 py-3">
            <span className="text-sm font-bold text-red-400">MISSED</span>
            <span className="text-2xl font-bold text-red-400">{missed}</span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-black/40 px-4 py-3">
            <span className="text-sm font-bold text-yellow-400">ERROR</span>
            <span className="text-2xl font-bold text-yellow-400">{error}</span>
          </div>
        </div>
      </div>
    </MovablePopup>
  )
}
