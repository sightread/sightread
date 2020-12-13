import { RefCallback, RefObject, useCallback, useEffect, useLayoutEffect, useState } from 'react'

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

// Start observing an element and when it changes size call provided fn.
// Returns the cleanup fn.
function observe(element: Element, fn: (dim: Dimensions) => void): () => void {
  const observer = getSharedResizeObserver()
  if (!callbacks.has(element)) {
    callbacks.set(element, [])
  }
  callbacks.get(element)!.push(fn)
  observer.observe(element)
  return () => {
    removeItem(callbacks.get(element)!, fn)
    if (callbacks.get(element)?.length == 0) {
      observer.unobserve(element)
      callbacks.delete(element)
    }
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
export function useSize(): Dimensions & { measureRef: RefCallback<Element> } {
  const [size, setSize] = useState<Dimensions | null>(null)
  const refCb = useCallback((element: Element) => {
    if (!element) {
      return
    }
    const rect = element.getBoundingClientRect()
    setSize({ width: rect.width, height: rect.height })
    console.error('settingRef', { width: rect.width, height: rect.height }, element)
    return observe(element, (dims: Dimensions) => {
      setSize(dims)
    })
  }, [])

  let width = size?.width ?? 0
  let height = size?.height ?? 0
  return { width, height, measureRef: refCb }
}
