import { useRef, useEffect } from 'react'

export default function useEventListener(
  eventName: string,
  handler: EventListenerOrEventListenerObject,
  element: Element | typeof globalThis = globalThis,
) {
  // Create a ref that stores handler
  // This allows our effect below to always get latest handler ...
  // ... without us needing to pass it in effect deps array ...
  // ... and potentially cause effect to re-run every render.
  const savedHandler = useRef<EventListenerOrEventListenerObject>(handler)
  savedHandler.current = handler

  useEffect(() => {
    const handler = savedHandler.current
    element.addEventListener(eventName, handler)
    return () => element.removeEventListener(eventName, handler)
  }, [eventName, element])
}
