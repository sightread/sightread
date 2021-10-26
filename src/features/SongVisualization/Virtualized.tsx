import '@/features/player'
import React, { useState, useRef, useMemo } from 'react'
import { useRAFLoop, useSize } from '@/hooks'

/**
 * Virtualized rendering (occlusion).
 */
export function Virtualized({
  items,
  renderItem,
  getItemOffsets,
  getCurrentOffset,
  direction = 'vertical',
  itemFilter = () => true,
}: {
  items: any
  renderItem: any
  getItemOffsets: any
  getCurrentOffset: any
  direction?: any
  itemFilter?: any
}) {
  const innerRef: any = useRef(null)
  const { width, height, measureRef } = useSize()

  const sortedItems = useMemo(() => {
    return [...items].sort((i1, i2) => getItemOffsets(i1).start - getItemOffsets(i2).start)
  }, [items, getItemOffsets])

  const [[startIndex, stopIndex], setIndexes] = useState<any>(getRenderRange())
  const maxOffset = useMemo(() => {
    let max = 0
    for (let item of items) {
      max = Math.max(max, getItemOffsets(item).end)
    }
    return max
  }, [items, getItemOffsets])
  const offsetDir = direction === 'vertical' ? 'bottom' : 'left'

  function getRenderRange() {
    // TODO: overscan at start too?
    const viewportStart = getCurrentOffset() //- (direction === 'vertical' ? height : width) / 2
    const viewportEnd = viewportStart + (direction === 'vertical' ? height : width) * 1.5 // overscan a vp

    let firstIndex = 0
    for (let i = 0; i < sortedItems.length; i++) {
      const offsets = getItemOffsets(sortedItems[i])
      if (offsets.end >= viewportStart) {
        firstIndex = i
        break
      }
    }

    let lastIndex = firstIndex
    for (let i = firstIndex; i < sortedItems.length; i++) {
      const offsets = getItemOffsets(sortedItems[i])
      if (offsets.start >= viewportEnd) {
        lastIndex = i // off by 1 but extra so w/e.
        break
      }
    }
    if (lastIndex === firstIndex) {
      lastIndex = items.length - 1
    }

    return [firstIndex, lastIndex]
  }

  useRAFLoop((dt: number) => {
    if (!innerRef.current) {
      return
    }
    let offset = getCurrentOffset()
    if (direction === 'vertical') {
      innerRef.current.style.transform = `translateY(${offset}px) translateZ(0px)`
    } else {
      innerRef.current.style.transform = `translateX(-${offset}px) translateZ(0px)`
    }

    const newIndexes = getRenderRange()
    if (startIndex !== newIndexes[0] || stopIndex !== newIndexes[1]) {
      setIndexes(newIndexes)
    }
  })

  return (
    <div
      style={{
        position: 'absolute',
        willChange: 'transform',
        [direction === 'vertical' ? 'height' : 'width']: maxOffset,
        height: '100%',
        width: '100%',
      }}
      ref={innerRef}
    >
      <div style={{ position: 'absolute', height: '100%', width: '100%' }} ref={measureRef} />
      {sortedItems
        .slice(startIndex, stopIndex)
        .filter((item) => itemFilter(item))
        .map((item, i) => (
          // TODO: can optimize by saving the rendered items to a cache.
          // While doing so remember to only do so lazily, instead of frontloading work.
          <div style={{ position: 'absolute', [offsetDir]: getItemOffsets(item).start }} key={i}>
            {renderItem(item, i)}
          </div>
        ))}
    </div>
  )
}
