import { usePlayer } from '@/features/player'
import { useEventListener, useRAFLoop, useSize } from '@/hooks'
import { clamp, formatTime } from '@/utils'
import clsx from 'clsx'
import { useAtomValue } from 'jotai'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

const CAPTURE_OPT = { capture: true }

export default function SongScrubBar({
  height,
  setRange = () => {},
  onSeek = () => {},
  onClick = () => {},
  rangeSelection,
  className,
  trackClassName,
  children,
}: {
  rangeSelection?: undefined | { start: number; end: number }
  setRange?: any
  onSeek?: any
  height: number
  onClick?: any
  className?: string
  trackClassName?: string
  children?: React.ReactNode
}) {
  const divRef = useRef<HTMLDivElement>(null)
  const progressBarLeftOffsetMeasure = useRef<HTMLDivElement>(null)
  const { width, measureRef } = useSize()
  const rangeRef = useRef<HTMLDivElement>(null)
  const progressBarLeftOffset = useRef<number>(0)
  const player = usePlayer()
  const isDraggingL = useRef(false)
  const isDraggingR = useRef(false)
  const isPointerDown = useRef(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<SongScrubTooltipState>(DEFAULT_TOOLTIP)
  const song = useAtomValue(player.song)
  const wrapperRef: React.Ref<HTMLDivElement> = useRef<any>(null)
  const isScrubbing = useRef<boolean>(false)

  const getProgress = useCallback(
    (e: MouseEvent) => {
      return clamp((e.clientX - progressBarLeftOffset.current) / width, { min: 0, max: 1 })
    },
    [width],
  )

  useRAFLoop(() => {
    if (!divRef.current) {
      return
    }
    const progress = player.getTime() / player.getDuration()
    divRef.current.style.transform = `translateX(${progress * width}px)`
    if (rangeRef.current && rangeSelection) {
      let start = rangeSelection.start
      let end = rangeSelection.end
      if (end < start) {
        ;[start, end] = [end, start]
        isDraggingL.current = !isDraggingL.current
        isDraggingR.current = !isDraggingR.current
      }
      rangeRef.current.style.left =
        progressBarLeftOffset.current + (start / player.getDuration()) * width + 'px'
      rangeRef.current.style.width = ((end - start) / player.getDuration()) * width + 'px'
    }
  })
  useEffect(() => {
    if (progressBarLeftOffsetMeasure.current) {
      progressBarLeftOffset.current = progressBarLeftOffsetMeasure.current.getBoundingClientRect().x
    }
  }, [width])

  const seekPlayer = useCallback(
    (e: MouseEvent) => {
      const progress = getProgress(e)
      const songTime = progress * player.getDuration()
      onSeek()
      player.seek(songTime)
    },
    [player, getProgress, onSeek],
  )

  let wasPlaying = useRef(false)
  useEventListener<PointerEvent>('pointerdown', (e) => {
    const target = e.target as HTMLElement
    if (progressBarRef.current?.contains(target) && !isDraggingL.current && !isDraggingR.current) {
      isScrubbing.current = true

      if (player.isPlaying()) {
        wasPlaying.current = true
        player.pause()
      }

      seekPlayer(e)
    }
  })

  useEventListener<PointerEvent>(
    'pointerup',
    (e) => {
      const target = e.target as HTMLElement
      const completedAction = isDraggingL.current || isDraggingR.current || isScrubbing.current
      const minorMissclick = wrapperRef.current?.contains(target)
      if (completedAction || minorMissclick) {
        e.stopPropagation()
      }
      isDraggingL.current = false
      isDraggingR.current = false
      isScrubbing.current = false

      if (wasPlaying.current) {
        wasPlaying.current = false
        player.play()
      }
    },
    undefined,
    CAPTURE_OPT,
  )

  useEventListener<PointerEvent>('pointermove', (e) => {
    const progress = getProgress(e)
    const songTime = progress * player.getDuration()
    if ((isDraggingL.current || isDraggingR.current) && rangeSelection) {
      if (isDraggingL.current) {
        rangeSelection.start = songTime
      } else {
        rangeSelection.end = songTime
      }
      setRange(rangeSelection)
    } else if (isScrubbing.current) {
      seekPlayer(e)
    }
  })

  const contextValue = useMemo(
    () => ({
      tooltip,
      tooltipRef,
    }),
    [tooltip],
  )

  return (
    <SongScrubContext.Provider value={contextValue}>
      <div
        className={clsx('relative flex w-full touch-none select-none', className)}
        onClick={onClick}
        style={{ height }}
        ref={wrapperRef}
      >
        {children}
        <div
          ref={progressBarRef}
          className={clsx(
            'relative h-full w-full self-center overflow-hidden rounded-full',
            trackClassName,
          )}
          onPointerDown={(event) => {
            isPointerDown.current = true
            event.currentTarget.setPointerCapture(event.pointerId)
          }}
          onPointerUp={(event) => {
            isPointerDown.current = false
            event.currentTarget.releasePointerCapture(event.pointerId)
            setTooltip((prev) => ({
              ...prev,
              visible: false,
            }))
          }}
          onPointerCancel={() => {
            isPointerDown.current = false
            setTooltip((prev) => ({
              ...prev,
              visible: false,
            }))
          }}
          onLostPointerCapture={() => {
            isPointerDown.current = false
            setTooltip((prev) => ({
              ...prev,
              visible: false,
            }))
          }}
          onPointerLeave={() => {
            if (isPointerDown.current) {
              return
            }
            setTooltip((prev) => ({
              ...prev,
              visible: false,
            }))
          }}
          onPointerMove={(event) => {
            if (!progressBarRef.current || !song) {
              return
            }
            const rect = progressBarRef.current.getBoundingClientRect()
            if (
              !isPointerDown.current &&
              (event.clientX < rect.left ||
                event.clientX > rect.right ||
                event.clientY < rect.top ||
                event.clientY > rect.bottom)
            ) {
              setTooltip((prev) => ({
                ...prev,
                visible: false,
              }))
              return
            }
            const progress = clamp((event.clientX - rect.left) / rect.width, {
              min: 0,
              max: 1,
            })
            const songTime = progress * player.getDuration()
            const measure = player.getMeasureForTime(songTime)
            const tooltipWidth = tooltipRef.current?.offsetWidth ?? 0
            const tooltipLeft = clamp(event.clientX - rect.left - tooltipWidth / 2, {
              min: 0,
              max: Math.max(0, rect.width - tooltipWidth),
            })
            setTooltip({
              visible: true,
              left: tooltipLeft,
              time: formatTime(player.getRealTimeDuration(0, songTime)),
              measure: String(measure?.number ?? '--'),
            })
          }}
        >
          <div ref={progressBarLeftOffsetMeasure} className="absolute" />
          <div ref={measureRef} className="absolute h-full w-full bg-gray-400" />
          <div
            ref={divRef}
            className="bg-purple-primary pointer-events-none absolute h-full w-full"
            style={{ left: -width }}
          />
        </div>
        {rangeSelection && (
          <div ref={rangeRef} className="pointer-events-none absolute flex h-full items-center">
            <div className="bg-purple-dark/40 absolute h-4 w-[calc(100%-10px)]" />
            <div
              className="bg-purple-dark/90 hover:bg-purple-hover/90 pointer-events-auto absolute left-0 h-6 w-6 -translate-x-1/2 cursor-pointer rounded-full transition"
              onPointerDown={() => (isDraggingL.current = true)}
            />
            <div
              className="bg-purple-dark/90 hover:bg-purple-hover/90 pointer-events-auto absolute right-0 h-6 w-6 translate-x-1/2 cursor-pointer rounded-full transition"
              onPointerDown={() => (isDraggingR.current = true)}
            />
          </div>
        )}
      </div>
    </SongScrubContext.Provider>
  )
}

type SongScrubTooltipState = {
  visible: boolean
  left: number
  time: string
  measure: string
}

const DEFAULT_TOOLTIP: SongScrubTooltipState = {
  visible: false,
  left: 0,
  time: '00:00',
  measure: '--',
}

type SongScrubContextValue = {
  tooltip: SongScrubTooltipState
  tooltipRef: React.RefObject<HTMLDivElement | null>
}

const SongScrubContext = createContext<SongScrubContextValue | null>(null)

export function SongScrubTooltip() {
  const context = useContext(SongScrubContext)

  if (!context || !context.tooltip.visible) {
    return null
  }

  return (
    <div
      ref={context.tooltipRef}
      className="pointer-events-none absolute z-30 min-w-max rounded-lg bg-black/90 px-4 py-2"
      style={{ left: context.tooltip.left, bottom: '100%', marginBottom: 19 }}
    >
      <span className="mr-6 text-gray-300">
        Time: <span className="text-purple-hover text-sm">{context.tooltip.time}</span>
      </span>
      <span className="text-gray-300">
        Measure: <span className="text-purple-hover text-sm">{context.tooltip.measure}</span>
      </span>
    </div>
  )
}

const DEFAULT_TIME = '00:00'

export function useSongScrubTimes() {
  const player = usePlayer()
  const song = useAtomValue(player.song)
  const [currentTime, setCurrentTime] = useState(DEFAULT_TIME)

  useRAFLoop(() => {
    const time = player.getRealTimeDuration(0, player.getTime())
    setCurrentTime(formatTime(time))
  })

  const duration = useMemo(() => {
    if (!song) {
      return DEFAULT_TIME
    }
    return formatTime(player.getRealTimeDuration(0, song.duration))
  }, [player, song])

  return { currentTime, duration }
}
