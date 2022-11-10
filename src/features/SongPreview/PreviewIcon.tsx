import { Play, Loader } from '@/icons'
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
    <Loader width={60} height={60} className="text-white animate-spin" />
  ) : (
    <div
      className={clsx(
        'text-purple-primary hover:text-purple-hover cursor-pointer',
        'rounded-full bg-white w-16 h-16 grid place-items-center',
      )}
      onClick={onPlay}
    >
      <Play height={36} width={36} className="relative left-1" />
    </div>
  )
  return (
    <div
      className="z-10 absolute grid place-items-center w-full h-full bg-gray-700/70"
      onClick={(e) => e.stopPropagation()}
    >
      {icon}
    </div>
  )
}
