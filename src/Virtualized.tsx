import './player'
import React, { useState, useRef, useMemo } from 'react'
import { useRAFLoop } from './hooks'

/**
 * Virtualized rendering (occlusion).
 */
export function Virtualized({
  position,
  items,
  renderItem,
  getItemOffsets,
  getCurrentOffset,
  direction = 'vertical',
  itemFilter = () => true,
  height = undefined,
  width = undefined,
}: any) {
  const outerRef: any = useRef(null)
  const innerRef: any = useRef(null)

  const sortedItems = useMemo(() => {
    let itms = [...items]
    itms.sort((i1, i2) => getItemOffsets(i1).start - getItemOffsets(i2).start)
    return itms
  }, [items, getItemOffsets])

  const [[startIndex, stopIndex], setIndexes] = useState<any>(getRenderRange())
  const maxOffset = useMemo(() => {
    let max = 0
    for (let item of items) {
      max = Math.max(max, getItemOffsets(item).end)
    }
    return max
  }, [items, getItemOffsets])

  const renderedItems = useMemo(() => {
    sortedItems.sort((i1, i2) => getItemOffsets(i1).start - getItemOffsets(i2).start)
    return sortedItems.map((item, i) => {
      let offsetDir = direction === 'vertical' ? 'bottom' : 'left'
      let renderedItem = (
        <div style={{ position: 'absolute', [offsetDir]: getItemOffsets(item).start }} key={i}>
          {renderItem(item, i)}
        </div>
      )

      return { renderedItem, item }
    })
  }, [sortedItems, renderItem, getItemOffsets, direction])

  function getRenderRange() {
    const viewportStart = getCurrentOffset()
    const viewportEnd = viewportStart + (direction === 'vertical' ? height : width) * 2 // overscan a vp

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
    if (!outerRef.current || !innerRef.current) {
      return
    }
    let offset = getCurrentOffset()
    if (direction === 'vertical') {
      innerRef.current.style.transform = `translateY(${-(
        maxOffset -
        offset -
        height
      )}px) translateZ(0px)`
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
        position,
        overflow: 'hidden',
        height,
        width,
      }}
      ref={outerRef}
    >
      <div
        style={{
          position: 'absolute',
          willChange: 'transform',
          [direction === 'vertical' ? 'height' : 'width']: maxOffset,
        }}
        ref={innerRef}
      >
        {renderedItems
          .slice(startIndex, stopIndex)
          .filter((rItem) => itemFilter(rItem.item))
          .map((rItem) => rItem.renderedItem)}
      </div>
    </div>
  )
}
