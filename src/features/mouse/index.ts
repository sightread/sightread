import { isBrowser } from '@/utils'

let isMouseDown_ = false
let mouseCoordinates = { x: Infinity, y: Infinity }
const setMouseDown = () => (isMouseDown_ = true)
const setMouseUp = () => (isMouseDown_ = false)
const setMouseLocation = (e: MouseEvent) => (mouseCoordinates = { x: e.x, y: e.clientY })

if (isBrowser()) {
  window.addEventListener('mousedown', setMouseDown, { passive: true })
  window.addEventListener('mouseup', setMouseUp, { passive: true })
  window.addEventListener('mousemove', setMouseLocation, { passive: true })
}

export function isMouseDown(): boolean {
  return isMouseDown_
}

type Point = { x: number; y: number }
export function getMouseCoordinates(): Point {
  return mouseCoordinates
}

export function getRelativeMouseCoordinates(xOrigin: number, yOrigin: number): Point {
  return { x: mouseCoordinates.x - xOrigin, y: mouseCoordinates.y - yOrigin }
}
