import { RefObject, useEffect, useState } from 'react'

let resizeObserver: ResizeObserver
let callbacks: WeakMap<Element, Array<(x: Dimensions) => void>>

function getSharedResizeObserver(): ResizeObserver {
  if (!resizeObserver) {
    callbacks = new WeakMap()
    resizeObserver = new ResizeObserver((entries) => {
      const seen = new Set()
      for (let i = entries.length - 1; i >= 0; i--) {
        const { target, contentRect } = entries[i]
        if (seen.has(target)) {
          continue
        }
        seen.add(target)
        callbacks
          .get(target)
          ?.forEach((f) => f({ width: contentRect.width, height: contentRect.height }))
      }
    })
  }
  return resizeObserver
}
function observe(element: Element, fn: (dim: Dimensions) => void): () => void {
  const observer = getSharedResizeObserver()
  if (!callbacks.has(element)) {
    callbacks.set(element, [])
  }
  callbacks.get(element)!.push(fn)
  observer.observe(element)
  return () => {
    observer.unobserve(element)
    removeItem(callbacks.get(element)!, fn)
  }
}

function removeItem(arr: Array<any>, val: any) {
  var index = arr?.indexOf(val)
  if (index > -1) {
    arr.splice(index, 1)
  }
}

/**
 * @example
 * const {width, height} = useSize(ref);
 */
type Dimensions = { width: number; height: number }
export function useSize(ref: RefObject<Element>): Dimensions {
  const [size, setSize] = useState<Dimensions>({ width: 0, height: 0 })
  const element = ref.current

  useEffect(() => {
    if (!element) {
      return
    }
    return observe(element, (resizeEvent) => setSize(resizeEvent as any))
  }, [element])

  return size
}
