import { useRef } from 'react'
import Player from '../player'
import { useRAFLoop } from '../hooks'
import { MinusIcon, PlusIcon } from '../icons'
import { css } from '@sightread/flakecss'

const classes = css({
  figmaIcon: {
    cursor: 'pointer',
    '& path': {
      fill: 'white',
    },
    '&:hover path': {
      fill: 'rgba(58, 104, 231, 1)',
    },
  },
})

export function BpmDisplay() {
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
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 110 }}
    >
      <span
        style={{ display: 'inline-block' }}
        className={classes.figmaIcon}
        onClick={() => player.decreaseBpm()}
      >
        <MinusIcon height={25} width={25} className={classes.figmaIcon} />
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', color: 'white', minWidth: 64 }}>
        <span style={{ fontSize: 24, textAlign: 'center' }} ref={percentRef} />
        <span style={{ fontSize: 16, textAlign: 'center' }} ref={bpmRef} />
      </div>
      <span
        style={{ display: 'inline-block' }}
        className={classes.figmaIcon}
        onClick={() => player.increaseBpm()}
      >
        <PlusIcon height={25} width={25} className={classes.figmaIcon} />
      </span>
    </div>
  )
}
