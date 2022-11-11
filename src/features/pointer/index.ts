import { isBrowser } from '@/utils'

type Point = { x: number; y: number }
type Velocity = { x: number; y: number }

let isPointerDown_ = false
let pointerCoordinates: Point = { x: Infinity, y: Infinity }
let pointerVelocity: Velocity = { x: 0, y: 0 }
function setPointerDown(e: PointerEvent) {
  isPointerDown_ = true
  setPointerLocation(e)
}
function setPointerUp(e: PointerEvent) {
  isPointerDown_ = false
  setPointerLocation(e)
}
const setPointerLocation = (e: PointerEvent) => {
  const { clientX: x, clientY: y } = e
  if (isPointerDown_) {
    pointerVelocity = { x: x - pointerCoordinates.x, y: y - pointerCoordinates.y }
  } else {
    pointerVelocity = { x: 0, y: 0 }
  }
  pointerCoordinates = { x, y }
}

if (isBrowser()) {
  window.addEventListener('pointerdown', setPointerDown, { passive: true, capture: true })
  window.addEventListener('pointerup', setPointerUp, { passive: true, capture: true })
  window.addEventListener('pointermove', setPointerLocation, { passive: true, capture: true })
}

export function isPointerDown(): boolean {
  return isPointerDown_
}

export function getPointerCoordinates(): Point {
  return pointerCoordinates
}

export function getPointerVelocity(): Velocity {
  return pointerVelocity
}

export function getRelativePointerCoordinates(xOrigin: number, yOrigin: number): Point {
  return { x: pointerCoordinates.x - xOrigin, y: pointerCoordinates.y - yOrigin }
}
