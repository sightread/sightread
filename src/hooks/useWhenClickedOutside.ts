import { useInteractOutside } from '@react-aria/interactions'
import { RefObject } from 'react'

export default function useWhenClickedOutside(
  handleMouseEvent: (e: MouseEvent) => void,
  ref: RefObject<HTMLElement | null>,
): void {
  useInteractOutside({
    ref,
    onInteractOutside: (e) => {
      handleMouseEvent(e)
    },
  })
}
