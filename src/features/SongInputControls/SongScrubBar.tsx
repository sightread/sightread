import { useState, useRef, useEffect, useCallback } from 'react'
import { formatTime } from '@/utils'
import { useRAFLoop, useSize } from '@/hooks'
import { Song } from '@/types'
import Player from '@/features/player'
import { palette } from '@/styles/common'

// TODO: animate filling up the green of current measure
// TODO support seeking to start of current measure
export default function SongScrubBar({
  song,
  rangeSelecting = false,
  setRange = () => {},
  onSeek = () => {},
}: {
  song: Song | null
  rangeSelecting?: boolean
  setRange?: any
  onSeek?: any
}) {
  const [mousePressed, setMousePressed] = useState(false) // TODO: mouse state shouldn't need to be ui state.
  const [mouseOver, setMouseOver] = useState(false)
  const divRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { width, measureRef } = useSize()
  const currentTimeRef = useRef<HTMLSpanElement>(null)
  const timeSpanRef = useRef<HTMLSpanElement>(null)
  const measureSpanRef = useRef<HTMLSpanElement>(null)
  const toolTipRef = useRef<HTMLDivElement>(null)
  const rangeRef = useRef<HTMLDivElement>(null)
  const rangeSelection = useRef<null | { start: number; end: number }>(null)
  const startX = useRef<number>(0)
  const player = Player.player()
  const isDraggingL = useRef(false)
  const isDraggingR = useRef(false)

  const getProgress = useCallback(
    (x: number) => {
      return Math.min(Math.max((x - startX.current) / width, 0), 1)
    },
    [width],
  )

  useRAFLoop(() => {
    if (!divRef.current) {
      return
    }
    const progress = Math.min(player.getTime() / player.getDuration(), 1)
    divRef.current.style.transform = `translateX(${progress * width}px)`
    if (currentTimeRef.current) {
      const time = player.getRealTimeDuration(0, player.getTime())
      currentTimeRef.current.innerText = String(formatTime(time))
    }
    if (rangeRef.current && rangeSelection.current) {
      const start = Math.min(rangeSelection.current.start, rangeSelection.current.end)
      const end = Math.max(rangeSelection.current.start, rangeSelection.current.end)
      rangeRef.current.style.left = (start / player.getDuration()) * width + 'px'
      rangeRef.current.style.width = ((end - start) / player.getDuration()) * width + 'px'
    }
  })
  useEffect(() => {
    if (wrapperRef.current) {
      startX.current = wrapperRef.current.getBoundingClientRect().x
    }
  }, [width])

  useEffect(() => {
    if (rangeSelecting) {
      rangeSelection.current = null
    }
  }, [rangeSelecting, player])

  function seekPlayer(clientX: number) {
    const progress = getProgress(clientX)
    const songTime = progress * player.getDuration()
    onSeek()
    player.seek(songTime)
  }

  useEffect(() => {
    if (mousePressed) {
      const handleUp = () => {
        setMousePressed(false)
        isDraggingL.current = false
        isDraggingR.current = false
        if (rangeSelecting) {
          const { start, end } = rangeSelection.current!
          const range = { start, end: end ?? 0 }
          setRange(range)
        }
      }
      const handler = (e: MouseEvent) => {
        const progress = getProgress(e.clientX)
        const songTime = progress * player.getDuration()
        if (rangeSelecting) {
          rangeSelection.current = { start: rangeSelection.current?.start ?? 0, end: songTime }
        } else if ((isDraggingL.current || isDraggingR.current) && rangeSelection.current) {
          if (isDraggingL.current) {
            rangeSelection.current.start = songTime
          } else {
            rangeSelection.current.end = songTime
          }
          seekPlayer(e.clientX - 4)
          setRange(rangeSelection.current)
        } else {
          seekPlayer(e.clientX)
        }
      }

      window.addEventListener('mousemove', handler)
      window.addEventListener('mouseup', handleUp)
      return () => {
        window.removeEventListener('mousemove', handler)
        window.removeEventListener('mouseup', handleUp)
      }
    }
  }, [mousePressed, rangeSelecting, player, getProgress, setRange])

  return (
    <div
      ref={wrapperRef}
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        position: 'absolute',
        borderBottom: 'black solid 1px',
        userSelect: 'none',
      }}
      onMouseDown={(e) => {
        setMousePressed(true)
        if (isDraggingL.current || isDraggingR.current) {
          seekPlayer(e.clientX - 4)
          return
        } else if (!rangeSelecting) {
          seekPlayer(e.clientX)
          return
        }

        const progress = getProgress(e.clientX)
        const songTime = progress * player.getDuration()
        rangeSelection.current = { start: songTime, end: songTime }
      }}
      onMouseOver={() => setMouseOver(true)}
      onMouseOut={() => setMouseOver(false)}
      onMouseMove={(e: React.MouseEvent) => {
        if (!player.song) {
          return
        }

        if (measureSpanRef.current && timeSpanRef.current && toolTipRef.current) {
          const progress = getProgress(e.clientX)
          const songTime = progress * player.getDuration()
          const measure = player.getMeasureForTime(songTime)
          toolTipRef.current.style.left = `${Math.min(
            width - 150,
            e.clientX - startX.current + 10,
          )}px`
          measureSpanRef.current.innerText = String(measure?.number)
          timeSpanRef.current.innerText = formatTime(player.getRealTimeDuration(0, songTime))
        }
      }}
    >
      <div ref={measureRef} style={{ width: '100%', height: '100%', position: 'absolute' }} />
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            height: '100%',
            width,
            backgroundColor: '#B0B0B0',
          }}
        />
        <div
          style={{
            position: 'absolute',
            height: 'calc(100%)',
            width,
            pointerEvents: 'none',
            backgroundColor: 'white',
            left: -width,
          }}
          className="scrubBar"
          ref={divRef}
        />
      </div>
      <span
        ref={currentTimeRef}
        style={{ position: 'absolute', bottom: 1, left: 4, color: '#242632', fontSize: 20 }}
      ></span>
      <span style={{ position: 'absolute', bottom: 1, right: 4, color: '#242632', fontSize: 20 }}>
        {song && formatTime(player.getRealTimeDuration(0, song.duration))}
      </span>
      <div
        style={{
          display: mouseOver ? 'flex' : 'none',
          position: 'absolute',
          left: 100,
          top: -45,
          height: '42px',
          width: '150px',
          backgroundColor: 'black',
          zIndex: 6,
        }}
        ref={toolTipRef}
      >
        <span
          style={{
            position: 'absolute',
            top: 12,
            left: 7,
            color: 'white',
            verticalAlign: 'center',
            fontSize: 12,
          }}
        >
          Time: <span ref={timeSpanRef} style={{ color: 'green' }} />
        </span>
        <span
          style={{
            position: 'absolute',
            top: 12,
            right: 7,
            color: 'white',
            verticalAlign: 'center',
            fontSize: 12,
          }}
        >
          Measure: <span ref={measureSpanRef} style={{ color: 'green' }} />
        </span>
      </div>
      {rangeSelection.current && (
        <div
          ref={rangeRef}
          style={{
            position: 'absolute',
            height: '100%',
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: 'calc(100% - 10px)',
              borderTop: `5px solid ${palette.green.light}`,
              borderBottom: `5px solid ${palette.green.light}`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              zIndex: 2,
              left: 0,
              width: 4,
              cursor: 'ew-resize',
              height: '100%',
              backgroundColor: palette.green.light,
            }}
            onMouseDown={() => (isDraggingL.current = true)}
          />
          <div
            style={{
              position: 'absolute',
              height: '100%',
              cursor: 'ew-resize',
              right: -4,
              width: 4,
              backgroundColor: palette.green.light,
            }}
            onMouseDown={() => (isDraggingR.current = true)}
          />
        </div>
      )}
    </div>
  )
}
