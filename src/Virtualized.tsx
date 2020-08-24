import './player'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { usePlayer, useRAFLoop, useWindowSize } from './hooks'
import { Song, SongMeasure, STAFF, SongNote } from './utils'

/**
 * Virtualized rendering (occlusion).
 */
export function Virtualized({
  items,
  renderItem,
  getItemOffsets,
  getCurrentOffset,
  direction,
  itemFilter = () => true,
}: any) {
  const outerRef: any = useRef(null)
  const innerRef: any = useRef(null)
  const windowSize = useWindowSize()

  const sortedItems = useMemo(() => {
    let itms = [...items]
    itms.sort((i1, i2) => getItemOffsets(i1).start - getItemOffsets(i2).start)
    return itms
  }, [items, getItemOffsets])

  const [[startIndex, stopIndex], setIndexes] = useState<any>(getRenderRange())
  const height = useMemo(() => {
    let max = 0
    for (let item of items) {
      max = Math.max(max, getItemOffsets(item).end)
    }
    return max
  }, [items, getItemOffsets])

  const renderedItems = useMemo(() => {
    sortedItems.sort((i1, i2) => getItemOffsets(i1).start - getItemOffsets(i2).start)
    return sortedItems.map((item, i) => {
      let renderedItem = (
        <div style={{ position: 'absolute', bottom: getItemOffsets(item).start }} key={i}>
          {renderItem(item, i)}
        </div>
      )

      return { renderedItem, item }
    })
  }, [sortedItems, renderItem, getItemOffsets])

  function getRenderRange() {
    const viewportStart = getCurrentOffset()
    const viewportEnd = viewportStart + windowSize.height * 2 // overscan a vp

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
    innerRef.current.style.transform = `translateY(${-(height - offset - windowSize.height)}px)`

    const newIndexes = getRenderRange()
    if (startIndex !== newIndexes[0] || stopIndex !== newIndexes[1]) {
      setIndexes(newIndexes)
    }
  })

  return (
    <div
      style={{
        position: 'fixed',
        overflow: 'hidden',
        height: windowSize.height,
        width: windowSize.width,
      }}
      ref={outerRef}
    >
      <div style={{ height, width: '100%' }} ref={innerRef}>
        {renderedItems
          .slice(startIndex, stopIndex)
          .filter((rItem) => itemFilter(rItem.item))
          .map((rItem) => rItem.renderedItem)}
      </div>
    </div>
  )
}
