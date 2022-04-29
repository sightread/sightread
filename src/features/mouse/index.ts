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

export function getMouseCoordinates(): { x: number; y: number } {
  return mouseCoordinates
}
