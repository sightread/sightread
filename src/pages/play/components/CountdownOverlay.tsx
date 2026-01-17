import clsx from 'clsx'

export type CountdownOverlayProps = {
  total: number
  remaining: number
}

export default function CountdownOverlay({ total, remaining }: CountdownOverlayProps) {
  const safeTotal = Math.max(0, Math.round(total))
  const safeRemaining = Math.max(0, Math.min(safeTotal, Math.round(remaining)))
  if (safeTotal === 0 || safeRemaining === 0) {
    return null
  }
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-black/50 px-6 py-4 text-white backdrop-blur">
      <div className="text-4xl font-semibold">{safeRemaining}</div>
      <div className="flex items-center gap-2">
        {Array.from({ length: safeTotal }).map((_, index) => {
          const isActive = index < safeRemaining
          return (
            <span
              key={index}
              className={clsx(
                'h-2.5 w-2.5 rounded-full transition',
                isActive ? 'bg-violet-300 shadow-[0_0_10px_rgba(196,181,253,0.6)]' : 'bg-white/20',
              )}
            />
          )
        })}
      </div>
    </div>
  )
}
