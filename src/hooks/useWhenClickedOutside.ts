import { useEffect, RefObject } from 'react'

export default function useWhenClickedOutside(
  handleMouseEvent: (e: MouseEvent) => void,
  ref: RefObject<HTMLElement>,
  deps?: any[],
): void {
  useEffect(() => {
    function outsideClickHandler(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) {
        handleMouseEvent(e)
      }
    }
    window.addEventListener('click', outsideClickHandler)
    return () => {
      window.removeEventListener('click', outsideClickHandler)
    }
  }, deps)
}
