import { isBrowser } from '@/utils'

type Point = { x: number; y: number }
type Velocity = { x: number; y: number }

let isPointerDown_ = false
let pointerCoordinates: Point = { x: Infinity, y: Infinity }
let pointerVelocity: Velocity = { x: 0, y: 0 }

function resetPointer() {
  isPointerDown_ = false
  pointerCoordinates = { x: Infinity, y: Infinity }
  pointerVelocity = { x: 0, y: 0 }
}

type PointerLikeEvent = { clientX: number; clientY: number }

const setPointerLocation = (e: PointerLikeEvent) => {
  const { clientX: x, clientY: y } = e
  if (isPointerDown_) {
    pointerVelocity = { x: x - pointerCoordinates.x, y: y - pointerCoordinates.y }
  } else {
    pointerVelocity = { x: 0, y: 0 }
  }
  pointerCoordinates = { x, y }
}

if (isBrowser()) {
  window.addEventListener('pointermove', setPointerLocation, { passive: true, capture: true })
}

export function handlePointerDown(e: PointerLikeEvent) {
  isPointerDown_ = true
  setPointerLocation(e)
}

export function handlePointerMove(e: PointerLikeEvent) {
  setPointerLocation(e)
}

export function handlePointerUp(e: PointerLikeEvent) {
  isPointerDown_ = false
  setPointerLocation(e)
}

export function handlePointerCancel() {
  resetPointer()
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
