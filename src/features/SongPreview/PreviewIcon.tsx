import { Loader, Play } from '@/icons'
import clsx from 'clsx'
import { MouseEvent } from 'react'

type PreviewIconProps = {
  isPlaying: boolean
  isLoading: boolean
  onPlay: (e: MouseEvent) => void
}
export default function PreviewIcon({ isPlaying, isLoading, onPlay }: PreviewIconProps) {
  if (isPlaying) {
    return null
  }
  const icon = isLoading ? (
    <Loader width={60} height={60} className="animate-spin text-white" />
  ) : (
    <div
      className={clsx(
        'cursor-pointer text-purple-primary hover:text-purple-hover',
        'grid h-16 w-16 place-items-center rounded-full bg-white',
      )}
      onClick={onPlay}
    >
      <Play height={36} width={36} className="relative left-1" />
    </div>
  )
  return (
    <div
      className="absolute z-10 grid h-full w-full place-items-center bg-gray-700/70"
      onClick={(e) => e.stopPropagation()}
    >
      {icon}
    </div>
  )
}
