import { Loader, Pause, Play } from '@/icons'
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
  return <Loader width={24} height={24} className="m-0 animate-spin p-0 text-white" />
}
