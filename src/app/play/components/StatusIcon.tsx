import { Pause, Play, Loader } from '@/icons'
import { ButtonWithTooltip } from './TopBar'

export default function StatusIcon({
  isPlaying,
  onTogglePlaying,
  isLoading,
}: {
  isPlaying: boolean
  onTogglePlaying: () => void
  isLoading: boolean
}) {
  if (isPlaying) {
    return (
      <ButtonWithTooltip tooltip="Pause" onClick={onTogglePlaying}>
        <Pause size={24} />
      </ButtonWithTooltip>
    )
  }

  if (!isLoading) {
    return (
      <ButtonWithTooltip tooltip="Play" onClick={onTogglePlaying}>
        <Play size={24} />
      </ButtonWithTooltip>
    )
  }
  return <Loader width={24} height={24} className="text-white animate-spin m-0 p-0" />
}
