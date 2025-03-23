import { usePlayer } from '@/features/player'
import { useEventListener, useRAFLoop, useSize } from '@/hooks'
import { Song } from '@/types'
import { clamp, formatTime } from '@/utils'
import clsx from 'clsx'
import { useAtomValue } from 'jotai'
import { use, useCallback, useEffect, useRef, useState } from 'react'

const CAPTURE_OPT = { capture: true }

export default function SongScrubBar({
  height,
  setRange = () => {},
  onSeek = () => {},
  onClick = () => {},
  rangeSelection,
}: {
  rangeSelection?: undefined | { start: number; end: number }
  setRange?: any
  onSeek?: any
  height: number
  onClick?: any
}) {
  const [pointerOver, setPointerOver] = useState(false)
  const divRef = useRef<HTMLDivElement>(null)
  const progressBarLeftOffsetMeasure = useRef<HTMLDivElement>(null)
  const { width, measureRef } = useSize()
  const currentTimeRef = useRef<HTMLSpanElement>(null)
  const timeSpanRef = useRef<HTMLSpanElement>(null)
  const measureSpanRef = useRef<HTMLSpanElement>(null)
  const toolTipRef = useRef<HTMLDivElement>(null)
  const rangeRef = useRef<HTMLDivElement>(null)
  const progressBarLeftOffset = useRef<number>(0)
  const player = usePlayer()
  const isDraggingL = useRef(false)
  const isDraggingR = useRef(false)
  const song: Song | null = useAtomValue(player.song)
  const progressBarRef: React.Ref<HTMLDivElement> = useRef<any>(null)
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
    if (currentTimeRef.current) {
      const time = player.getRealTimeDuration(0, player.getTime())
      currentTimeRef.current.innerText = String(formatTime(time))
    }
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

  useEventListener<PointerEvent>('pointerdown', (e) => {
    const target = e.target as HTMLElement
    if (progressBarRef.current?.contains(target) && !isDraggingL.current && !isDraggingR.current) {
      isScrubbing.current = true
      seekPlayer(e)
    }
  })

  useEventListener<PointerEvent>(
    'click',
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

  return (
    <div
      className="relative flex w-full border-b border-b-black bg-gray-300 select-none"
      onClick={onClick}
      style={{ height }}
      ref={wrapperRef}
      onPointerMove={(e: React.MouseEvent) => {
        if (
          !player.getSong() ||
          !measureSpanRef.current ||
          !timeSpanRef.current ||
          !toolTipRef.current
        ) {
          return
        }

        const progress = getProgress(e as any)
        const songTime = progress * player.getDuration()
        const measure = player.getMeasureForTime(songTime)
        // TODO: The 90 in the line below should be dynamic based on the size of ToolTipRef
        toolTipRef.current.style.left = `${clamp(e.clientX - progressBarLeftOffset.current - 24, {
          min: 0,
          max: width - 90,
        })}px`
        measureSpanRef.current.innerText = String(measure?.number)
        timeSpanRef.current.innerText = formatTime(player.getRealTimeDuration(0, songTime))
      }}
    >
      <div
        className={clsx(
          pointerOver ? 'flex' : 'hidden',
          'absolute z-30 min-w-max items-center justify-between gap-8',
          '-top-1 rounded-lg bg-black/90 px-4 py-2',
          '-translate-y-full',
        )}
        ref={toolTipRef}
      >
        <span className="text-gray-300">
          Time: <span className="text-purple-hover text-sm" ref={timeSpanRef} />
        </span>
        <span className="text-gray-300">
          Measure: <span className="text-purple-hover text-sm" ref={measureSpanRef} />
        </span>
      </div>
      <span ref={currentTimeRef} className="min-w-[80px] self-center px-4 py-2 text-black" />
      <div
        ref={progressBarRef}
        className="relative h-4 grow self-center overflow-hidden rounded-full"
        onPointerOver={() => setPointerOver(true)}
        onPointerOut={() => setPointerOver(false)}
      >
        <div ref={progressBarLeftOffsetMeasure} className="absolute" />
        <div ref={measureRef} className={`absolute h-full w-full bg-gray-400`} />
        <div
          ref={divRef}
          className={`bg-purple-primary pointer-events-none absolute h-full w-full`}
          style={{ left: -width }}
        />
      </div>
      <span className="min-w-[80px] self-center px-4 py-2 text-black">
        {song ? formatTime(player.getRealTimeDuration(0, song.duration)) : '00:00'}
      </span>
      {rangeSelection && (
        <div ref={rangeRef} className="pointer-events-none absolute flex h-full items-center">
          <div className="bg-purple-dark/40 absolute h-4 w-[calc(100%-10px)]" />
          <div
            className="bg-purple-dark/90 hover:bg-purple-hover/90 pointer-events-auto absolute left-0 h-6 w-6 -translate-x-1/2 cursor-pointer rounded-full transition"
            onPointerEnter={() => setPointerOver(true)}
            onPointerLeave={() => setPointerOver(false)}
            onPointerDown={() => (isDraggingL.current = true)}
          />
          <div
            className="bg-purple-dark/90 hover:bg-purple-hover/90 pointer-events-auto absolute right-0 h-6 w-6 translate-x-1/2 cursor-pointer rounded-full transition"
            onPointerDown={() => (isDraggingR.current = true)}
            onPointerEnter={() => setPointerOver(true)}
            onPointerLeave={() => setPointerOver(false)}
          />
        </div>
      )}
    </div>
  )
}
