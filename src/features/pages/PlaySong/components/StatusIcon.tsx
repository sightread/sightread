import { PauseIcon, PlayIcon, LoadingIcon } from '@/icons'
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
        <PauseIcon width={24} height={24} />
      </ButtonWithTooltip>
    )
  }

  if (!isLoading) {
    return (
      <ButtonWithTooltip tooltip="Play" onClick={onTogglePlaying}>
        <PlayIcon height={24} width={24} />
      </ButtonWithTooltip>
    )
  }
  return <LoadingIcon width={24} height={24} className="fill-white animate-spin m-0 p-0" />
}
