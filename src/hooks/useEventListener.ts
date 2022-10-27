import { useRef, useEffect } from 'react'

export default function useEventListener<T extends Event>(
  eventName: string,
  handler: (event: T) => void,
  element: Element | typeof globalThis = globalThis,
) {
  // Create a ref that stores handler
  // This allows our effect below to always get latest handler ...
  // ... without us needing to pass it in effect deps array ...
  // ... and potentially cause effect to re-run every render.
  const savedHandler = useRef<(event: T) => void>(handler)
  savedHandler.current = handler

  useEffect(() => {
    const handler = (e: T) => savedHandler.current(e)
    element.addEventListener(eventName, handler as any)
    return () => element.removeEventListener(eventName, handler as any)
  }, [eventName, element])
}
