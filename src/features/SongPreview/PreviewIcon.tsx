import { PlayIcon, LoadingIcon } from '@/icons'
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
    <LoadingIcon width={60} height={60} className="fill-white animate-spin" />
  ) : (
    <div className="rounded-full bg-gray-200 w-16 h-16 grid place-items-center">
      <PlayIcon
        height={36}
        width={36}
        className="fill-purple-primary relative left-1 hover:fill-purple-hover cursor-pointer"
        onClick={onPlay}
      />
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
