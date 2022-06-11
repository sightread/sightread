import { useEffect, RefObject } from 'react'

export default function useWhenClickedOutside(
  handleMouseEvent: (e: MouseEvent) => void,
  ref: RefObject<HTMLElement>,
  deps: any[],
): void {
  useEffect(() => {
    function outsideClickHandler(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) {
        handleMouseEvent(e)
      }
    }
    window.addEventListener('mousedown', outsideClickHandler)
    return () => {
      window.removeEventListener('mousedown', outsideClickHandler)
    }
  }, deps)
}
