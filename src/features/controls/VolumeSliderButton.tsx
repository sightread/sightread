import { Dropdown, Slider } from '@/components'
import { Volume2, VolumeX } from '@/icons'
import Player from '../player'

type SliderProps = {
  onChangeVolume: (volume: number) => void
  volume: number
}
function VerticalSliderVolume({ onChangeVolume, volume }: SliderProps) {
  return (
    <div className="flex flex-col items-center h-44 w-8 p-2 bg-white">
      <Slider
        orientation="vertical"
        min={0}
        max={1}
        step={0.01}
        value={[volume]}
        onValueChange={(val) => onChangeVolume(val[0])}
      />
      <span className="text-black text-sm text-center">
        {Math.round(Player.player().volume.value * 100)}
      </span>
    </div>
  )
}

export function VolumeSliderButton() {
  const player = Player.player()
  const isSoundOff = player.volume.value === 0
  const toggleVolume = () => (isSoundOff ? player.setVolume(1) : player.setVolume(0))

  return (
    <Dropdown
      target={
        <div className="text-white" onClick={toggleVolume}>
          {isSoundOff ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </div>
      }
      openOn="hover"
    >
      <VerticalSliderVolume
        onChangeVolume={(volume) => player.setVolume(volume)}
        volume={player.volume.value}
      />
    </Dropdown>
  )
}
