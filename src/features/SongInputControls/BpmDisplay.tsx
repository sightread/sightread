import { useRef } from 'react'
import Player from '@/features/player'
import { useRAFLoop } from '@/hooks'
import { MinusIcon, PlusIcon } from '@/icons'
import { css } from '@sightread/flake'
import { palette } from '@/styles/common'
import { ButtonWithTooltip } from '../pages/PlaySong/components/TopBar'

const classes = css({
  figmaIcon: {
    cursor: 'pointer',
    '& path': {
      fill: 'white',
    },
    '&:hover path': {
      fill: palette.purple.primary,
    },
  },
})

export default function BpmDisplay() {
  const bpmRef = useRef<HTMLSpanElement>(null)
  const percentRef = useRef<HTMLSpanElement>(null)
  const player = Player.player()

  useRAFLoop(() => {
    if (!bpmRef.current || !percentRef.current) {
      return
    }

    bpmRef.current.textContent = Math.floor(player.getBpm()) + ' BPM'
    percentRef.current.textContent = Math.floor(player.getBpmModifier() * 100) + '%'
  })

  return (
    <div className="flex gap-1 items-center justify-between select-none">
      <ButtonWithTooltip tooltip="Decrease BPM" onClick={() => player.decreaseBpm()}>
        <MinusIcon height={25} width={25} className={classes.figmaIcon} />
      </ButtonWithTooltip>
      <div className="flex flex-col text-white text-center">
        <span className="text-xl" ref={percentRef} />
        <span className="text-xs" ref={bpmRef} />
      </div>
      <ButtonWithTooltip tooltip="Increase BPM" onClick={() => player.increaseBpm()}>
        <PlusIcon height={25} width={25} className={classes.figmaIcon} />
      </ButtonWithTooltip>
    </div>
  )
}
