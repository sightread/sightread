import { usePlayer } from '@/features/player'
import { useEventListener, useRAFLoop, useSize } from '@/hooks'
import { Song } from '@/types'
import { clamp } from '@/utils'
import clsx from 'clsx'
import { useCallback, useRef } from 'react'

type TimelineStripProps = {
  song?: Song
  rangeSelection?: { start: number; end: number }
  setRange: (range?: { start: number; end: number }) => void
  isLooping: boolean
}

const MIN_HANDLE_WIDTH = 10
const MEASURE_LABEL_SPACING = 40

type MeasureFormat = {
  step: number
  tickEvery?: number
}

const getMeasureFormat = (measureCount: number, width: number): MeasureFormat => {
  if (!measureCount || !width) {
    return { step: 1 }
  }
  const maxLabels = Math.max(1, Math.floor(width / MEASURE_LABEL_SPACING))
  const steps = [1, 5, 10, 20, 40, 80]
  for (const step of steps) {
    const labelCount = step === 1 ? measureCount : 1 + Math.floor(measureCount / step)
    if (labelCount <= maxLabels) {
      if (step === 1) {
        return { step }
      }
      if (step === 5) {
        return { step, tickEvery: 1 }
      }
      return { step, tickEvery: Math.max(2, Math.floor(step / 5)) }
    }
  }
  const step = steps[steps.length - 1]
  return { step, tickEvery: Math.max(2, Math.floor(step / 5)) }
}

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
  const { step, tickEvery } = getMeasureFormat(measureCount, width)
  const labelIndices = Array.from({ length: measureCount }, (_, index) => index + 1).filter(
    (measureNumber) => measureNumber === 1 || measureNumber % step === 0,
  )
  const tickIndices =
    tickEvery && measureCount
      ? Array.from({ length: measureCount }, (_, index) => index + 1).filter(
          (measureNumber) =>
            measureNumber % tickEvery === 0 &&
            measureNumber !== 1 &&
            measureNumber % step !== 0,
        )
      : []

  return (
    <div className="relative h-10 w-full px-3 select-none">
      <div
        ref={setRefs}
        className="relative h-full w-full overflow-hidden rounded-md border border-[#2a2b33] bg-[#1b1c22]"
      >
        <div ref={progressRef} className="absolute top-0 bottom-0 left-0 bg-[rgb(31,35,45)]" />
        <div className="absolute inset-0">
          {labelIndices.map((measureNumber) => {
            const position = measureCount ? ((measureNumber - 1) / measureCount) * 100 : 0
            return (
              <div
                key={`label-${measureNumber}`}
                className="absolute inset-y-0"
                style={{ left: `${position}%` }}
              >
                <div className="grid h-full grid-rows-[1fr_auto_1fr] justify-items-center">
                  <div className="h-full w-px bg-[#2a2b33]" />
                  <span className="text-[10px] text-[#4b4f5b] whitespace-nowrap px-1">
                    {measureNumber}
                  </span>
                  <div className="h-full w-px bg-[#2a2b33]" />
                </div>
              </div>
            )
          })}
          {tickIndices.map((measureNumber) => {
            const position = measureCount ? ((measureNumber - 1) / measureCount) * 100 : 0
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
