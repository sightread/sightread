import { isBrowser } from '@/utils'

type Point = { x: number; y: number }
type Velocity = { x: number; y: number }

let isPointerDown_ = false
let pointerCoordinates: Point = { x: Infinity, y: Infinity }
let pointerVelocity: Velocity = { x: 0, y: 0 }
const setPointerDown = () => (isPointerDown_ = true)
const setPointerUp = () => (isPointerDown_ = false)
const setPointerLocation = (e: MouseEvent) => {
  const { clientX: x, clientY: y } = e
  if (isPointerDown_) {
    pointerVelocity = { x: x - pointerCoordinates.x, y: y - pointerCoordinates.y }
  } else {
    pointerVelocity = { x: 0, y: 0 }
  }
  pointerCoordinates = { x, y }
}

if (isBrowser()) {
  window.addEventListener('pointerdown', setPointerDown, { passive: true })
  window.addEventListener('pointerup', setPointerUp, { passive: true })
  window.addEventListener('pointermove', setPointerLocation, { passive: true })
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
