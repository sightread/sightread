import { RefCallback, useCallback, useEffect, useRef, useState } from 'react'

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
export default function useSize(): Dimensions & { measureRef: RefCallback<Element> } {
  const [size, setSize] = useState<Dimensions | null>(null)
  const cleanupFn = useRef<() => void | null>(null)
  const mountedRef = useRef(true)
  const refCb = useCallback((element: Element) => {
    if (!element) {
      cleanupFn.current?.()
      cleanupFn.current = null
      return
    }
    const rect = element.getBoundingClientRect()
    setSize({ width: rect.width, height: rect.height })
    cleanupFn.current = observe(element, (dims: Dimensions) => {
      if (mountedRef.current) {
        setSize(dims)
      }
    })
  }, [])

  // Save mounted state.
  // Lets us skip calls in case unmounted.
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  let width = size?.width ?? 0
  let height = size?.height ?? 0
  return { width, height, measureRef: refCb }
}
