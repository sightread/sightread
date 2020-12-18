import { useRef } from 'react'
import Player from '../player'
import { useRAFLoop } from '../hooks'

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
      <i className="fas fa-minus" onClick={() => player.decreaseBpm()} />
      <div style={{ display: 'flex', flexDirection: 'column', color: 'white' }}>
        <span style={{ fontSize: 24 }} ref={percentRef} />
        <span style={{ fontSize: 16 }} ref={bpmRef} />
      </div>
      <i className="fas fa-plus" onClick={() => player.increaseBpm()} />
    </div>
  )
}
