import { usePlayer } from '@/features/player'
import { useEventListener, useRAFLoop, useSize } from '@/hooks'
import { Song } from '@/types'
import { clamp } from '@/utils'
import clsx from 'clsx'
import { useCallback, useMemo, useRef } from 'react'
import { getTimelineMeasureMarks } from './TimelineStrip.utils'

type TimelineStripProps = {
  song?: Song
  rangeSelection?: { start: number; end: number }
  setRange: (range?: { start: number; end: number }) => void
  isLooping: boolean
}

const MIN_HANDLE_WIDTH = 10
const MEASURE_LABEL_SPACING = 40
const LABEL_EDGE_PADDING = MEASURE_LABEL_SPACING / 2
export default function TimelineStrip({
  song,
  rangeSelection,
  setRange,
  isLooping,
}: TimelineStripProps) {
  const player = usePlayer()
  const { width, measureRef } = useSize()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const progressRef = useRef<HTMLDivElement | null>(null)
  const playheadRef = useRef<HTMLDivElement>(null)
  const rangeRef = useRef<HTMLDivElement>(null)
  const isDraggingL = useRef(false)
  const isDraggingR = useRef(false)
  const isScrubbing = useRef(false)

  const duration = player.getDuration()

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node
      if (node) {
        measureRef(node)
      }
    },
    [measureRef],
  )

  const getProgress = (e: PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) {
      return 0
    }
    return clamp((e.clientX - rect.left) / rect.width, { min: 0, max: 1 })
  }

  useRAFLoop(() => {
    if (!playheadRef.current || !duration) {
      return
    }
    const progress = player.getTime() / duration
    playheadRef.current.style.transform = `translateX(${progress * width}px)`
    if (progressRef.current) {
      progressRef.current.style.width = `${progress * width}px`
    }
    if (rangeRef.current && rangeSelection) {
      let start = rangeSelection.start
      let end = rangeSelection.end
      if (end < start) {
        ;[start, end] = [end, start]
        isDraggingL.current = !isDraggingL.current
        isDraggingR.current = !isDraggingR.current
      }
      rangeRef.current.style.left = `${(start / duration) * width}px`
      rangeRef.current.style.width = `${((end - start) / duration) * width}px`
    }
  })

  useEventListener<PointerEvent>('pointerdown', (e) => {
    if (e.button !== 0) {
      return
    }
    const target = e.target as HTMLElement
    if (!containerRef.current?.contains(target)) {
      return
    }
    if (target.closest('[data-timeline-handle="true"]')) {
      return
    }
    isScrubbing.current = true
    player.seek(getProgress(e) * duration)
  })

  useEventListener<PointerEvent>('pointerup', () => {
    isDraggingL.current = false
    isDraggingR.current = false
    isScrubbing.current = false
  })

  useEventListener<PointerEvent>('pointermove', (e) => {
    if (!duration) {
      return
    }
    const progress = getProgress(e)
    const songTime = progress * duration
    if ((isDraggingL.current || isDraggingR.current) && rangeSelection) {
      if (isDraggingL.current) {
        setRange({ start: songTime, end: rangeSelection.end })
      } else {
        setRange({ start: rangeSelection.start, end: songTime })
      }
    } else if (isScrubbing.current) {
      player.seek(songTime)
    }
  })

  const measures = song?.measures ?? []
  const measureCount = measures.length
  const { labels: labelIndices, ticks: tickIndices } = getTimelineMeasureMarks({
    measureCount,
    width,
  })
  const measureTimeMap = useMemo(() => {
    return new Map(measures.map((measure) => [measure.number, measure.time]))
  }, [measures])
  const labelPositions = useMemo(() => {
    if (!duration || !width) {
      return []
    }
    const positions = labelIndices
      .map((measureNumber) => {
        const time = measureTimeMap.get(measureNumber)
        if (time == null) {
          return null
        }
        return { measureNumber, positionPx: (time / duration) * width }
      })
      .filter((entry): entry is { measureNumber: number; positionPx: number } => entry !== null)
    const filtered: Array<{ measureNumber: number; positionPx: number }> = []
    for (const entry of positions) {
      if (entry.positionPx < LABEL_EDGE_PADDING) {
        continue
      }
      const last = filtered[filtered.length - 1]
      if (last && entry.positionPx - last.positionPx < MEASURE_LABEL_SPACING) {
        continue
      }
      if (width - entry.positionPx < LABEL_EDGE_PADDING) {
        continue
      }
      filtered.push(entry)
    }
    return filtered
  }, [duration, width, labelIndices, measureTimeMap])

  return (
    <div className="relative h-10 w-full px-3 select-none">
      <div
        ref={setRefs}
        className="relative h-full w-full overflow-hidden rounded-md border border-[#2a2b33] bg-[#1b1c22]"
      >
        <div ref={progressRef} className="absolute top-0 bottom-0 left-0 bg-[rgb(31,35,45)]" />
        <div className="absolute inset-0">
          {labelPositions.map(({ measureNumber, positionPx }) => {
            const position = (positionPx / width) * 100
            return (
              <div
                key={`label-${measureNumber}`}
                className="absolute inset-y-0 -translate-x-1/2"
                style={{ left: `${position}%` }}
              >
                <div className="grid h-full grid-rows-[1fr_auto_1fr] justify-items-center">
                  <div className="h-full w-px bg-[#2a2b33]" />
                  <span className="px-1 text-[10px] whitespace-nowrap text-[#4b4f5b]">
                    {measureNumber}
                  </span>
                  <div className="h-full w-px bg-[#2a2b33]" />
                </div>
              </div>
            )
          })}
          {tickIndices.map((measureNumber) => {
            const time = measureTimeMap.get(measureNumber)
            if (time == null || !duration) {
              return null
            }
            const position = (time / duration) * 100
            return (
              <div
                key={`tick-${measureNumber}`}
                className="absolute bottom-0 h-1.5 w-px bg-[#2a2b33]/70"
                style={{ left: `${position}%` }}
              />
            )
          })}
        </div>
        {isLooping && rangeSelection && (
          <div
            ref={rangeRef}
            className="absolute top-1 bottom-1 rounded-sm border border-violet-400/40 bg-violet-500/15"
          >
            <div
              className={clsx(
                'absolute top-0 bottom-0 -left-1.5 flex w-3 items-center justify-center rounded-l bg-violet-500/90 shadow-md',
                'cursor-w-resize transition-colors hover:bg-violet-400',
              )}
              style={{ minWidth: MIN_HANDLE_WIDTH }}
              data-timeline-handle="true"
              onPointerDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
                isScrubbing.current = false
                isDraggingL.current = true
              }}
            >
              <div className="h-4 w-0.5 rounded-full bg-white/60" />
            </div>
            <div
              className={clsx(
                'absolute top-0 -right-1.5 bottom-0 flex w-3 items-center justify-center rounded-r bg-violet-500/90 shadow-md',
                'cursor-e-resize transition-colors hover:bg-violet-400',
              )}
              style={{ minWidth: MIN_HANDLE_WIDTH }}
              data-timeline-handle="true"
              onPointerDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
                isScrubbing.current = false
                isDraggingR.current = true
              }}
            >
              <div className="h-4 w-0.5 rounded-full bg-white/60" />
            </div>
          </div>
        )}
        <div
          ref={playheadRef}
          className="absolute top-0 bottom-0 left-0 w-[2px] bg-white shadow-[0_0_10px_rgba(139,92,246,0.6)]"
        >
          <div className="absolute -top-1 left-1/2 h-3 w-4 -translate-x-1/2 bg-white [clip-path:polygon(0_0,100%_0,50%_100%)]" />
        </div>
      </div>
    </div>
  )
}
