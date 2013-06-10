import Player from '@/features/player'
import { clamp } from '@/utils'
import { getPointerVelocity } from '../pointer'
import { intersectsWithPiano } from './falling-notes'
import { PIXELS_PER_SECOND as pps } from './utils'

const player = Player.player()

let isDragging_ = false
export function isDragging(): boolean {
  return isDragging_
}

function seekSeconds(seconds: number) {
  const songTime = clamp(seconds + player.getTime(), { min: 0, max: player.song.duration })
  player.seek(songTime)
}

const decayRate = 0.96
let acceleration = 0
function decay() {
  isDragging_ = false
  requestAnimationFrame(() => {
    const songSeconds = acceleration / pps
    // End touchscroll when the acceleration catches up to the natural song velocity.
    const endSnap = (1 / 60) * player.bpmModifier // TODO: instead of 1/60 it should be 1 / frameRate.
    if (Math.abs(songSeconds) > endSnap) {
      seekSeconds(songSeconds)
      acceleration *= decayRate
      decay()
    } else {
      endInertialScroll()
    }
  })
}

let wasPlaying = false
export function handleDown(e: PointerEvent) {
  if (intersectsWithPiano(e.clientY)) {
    isDragging_ = false
    return
  }

  isDragging_ = true
  const target = e.target as HTMLDivElement
  target.setPointerCapture(e.pointerId)
  if (player.isPlaying()) {
    wasPlaying = true
    player.pause()
  }
  acceleration = 0
  // TODO: doubleclick pause / play
}

export function handleUp(e: PointerEvent) {
  const target = e.target as HTMLDivElement
  target.releasePointerCapture(e.pointerId)
  decay()
}

// Should resume playback.
function endInertialScroll() {
  if (wasPlaying) {
    wasPlaying = false
    player.play()
  }
  acceleration = 0
}

export function handleMove(e: PointerEvent) {
  if (!isDragging_) {
    return
  }
  const yVel = getPointerVelocity().y
  seekSeconds(yVel / pps)

  //  Threshold to prevent accidental flings
  const threshold = 5
  if (Math.abs(yVel) > threshold) {
    acceleration = yVel
  } else {
    acceleration = 0
  }
}
