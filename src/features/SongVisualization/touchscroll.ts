import Player from '@/features/player'
import { clamp } from '@/utils'
import { getPointerVelocity, isPointerDown } from '../pointer'
import { intersectsWithPiano } from './falling-notes'

const player = Player.player()

let isDragging_ = false
export function isDragging(): boolean {
  return isDragging_
}

export function seekPlayer(seconds: number) {
  const songTime = clamp(seconds + player.getTime(), { min: 0, max: player.song.duration })
  player.seek(songTime)
}

// init acceleration
let acceleration = 0

// ! Careful balance is needed for these values.
// set decay falloff value, (How quickly it will come to a stop)
const dfalloff = 0.96
// set acceleration magnitude value (How much it scales with acceleration)
const aMag = 1

// TODO Calculate dfalloff and aMag proportionate to framerate

function decay() {
  isDragging_ = false
  requestAnimationFrame(() => {
    const dY = acceleration / PPS
    // End touchscroll when the acceleration catches up to the natural song velocity.
    const endSnap = (PPS * player.bpmModifier) / 1000 / 60
    if (Math.abs(dY) > endSnap) {
      seekPlayer(dY)
      acceleration *= dfalloff
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

// Must resume playback.
function endInertialScroll() {
  if (wasPlaying) {
    wasPlaying = false
    player.play()
  }
  acceleration = 0
}

// ? Threshold to prevent accidental acceleration
const threshold = 5

// TODO: share PPS across the entire app.
const PPS = 225

export function handleMove(e: PointerEvent) {
  if (!isDragging_) {
    return
  }
  const yVel = getPointerVelocity().y
  seekPlayer(yVel / PPS)
  if (Math.abs(yVel) > threshold) {
    acceleration = yVel * aMag
  } else {
    acceleration = 0
  }
  // ? Handleup if you want it to use acceleration even if you swipe off page.
}
