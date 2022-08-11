import Player from '@/features/player'

const player = Player.player()

const isMouseEvent = (e: MouseEvent | TouchEvent): e is MouseEvent => {
  return 'clientY' in e
}
const getTouchCoords = (e: TouchEvent) => {
  return e.targetTouches[0].clientY
}
export const getYCoordinate = (e: MouseEvent | TouchEvent) => {
  if (isMouseEvent(e)) {
    return e.clientY
  }
  return getTouchCoords(e)
}

export function seekPlayer(accel: number) {
  // TODO: get client h without a million callbacks
  const progress = accel / 1000
  const songTime = progress + player.getTime()
  player.seek(songTime)
}
// init acceleration
let acceleration = 0

// Stop acceleration when clicking again
export const stopAccel = () => {
  acceleration = 0
}
// calculate acceleration as dv/dt, where dt is in frames
export const velocity = (v2: number, v1: number) => {
  acceleration = v2 - v1
}

// ! Careful balance is needed for these values.
// set framerate
const framerate = 5
// set decay falloff value, (How quickly it will come to a stop)
const dfalloff = 0.9957
// set acceleration magnitude value (How much it scales with acceleration)
const aMag = 4
// Ending smoothness / snap to value
const endSnap = 0.5

// TODO Calculate dfalloff and aMag proportionate to framerate

export const decay = () => {
  //Delay frames
  setTimeout(() => {
    seekPlayer(acceleration * aMag)
    acceleration *= dfalloff
    if (Math.abs(acceleration) > endSnap) {
      decay()
    } else acceleration = 0
  }, framerate)
}
