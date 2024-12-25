import { RefObject, useEffect } from 'react'

export default function useWhenClickedOutside(
  handleMouseEvent: (e: MouseEvent) => void,
  ref: RefObject<HTMLElement | null>,
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
  }, [handleMouseEvent, ref])
}
