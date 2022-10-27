import { Hand, Song, SongConfig } from '@/types'
import { GivenState, render } from './canvasRenderer'
import { useRAFLoop, useSize } from '@/hooks'
import { useRef, useCallback, useMemo } from 'react'
import * as touchscroll from '@/features/SongVisualization/touchscroll'
import { PIXELS_PER_SECOND as pps } from './utils'

type HandSettings = {
  [trackId: string]: {
    hand: Hand | 'none'
  }
}

type CanvasRendererProps = {
  song: Song | undefined
  config: SongConfig
  hand: Hand
  handSettings: HandSettings
  getTime: () => number
  constrictView?: boolean
  selectedRange?: { start: number; end: number }
  disableTouchscroll?: boolean
}

function CanvasRenderer({
  song,
  config,
  hand,
  handSettings,
  selectedRange,
  getTime,
  constrictView = true,
  disableTouchscroll = false,
}: CanvasRendererProps) {
  const { width, height, measureRef } = useSize()
  const ctxRef = useRef<CanvasRenderingContext2D>()
  const canvasRef = useRef<HTMLCanvasElement>()

  const setupCanvas = useCallback(
    (canvasEl: HTMLCanvasElement) => {
      if (!canvasEl) {
        return
      }
      canvasEl.style.width = width + 'px'
      canvasEl.style.height = height + 'px'

      const scale = window.devicePixelRatio ?? 1
      canvasEl.width = Math.round(width * scale)
      canvasEl.height = Math.round(height * scale)
      const ctx = canvasEl.getContext('2d')!
      ctx.scale(scale, scale)
      ctxRef.current = ctx
      canvasRef.current = canvasEl
    },
    [width, height],
  )

  const canvasRect: DOMRect = useMemo(() => {
    return canvasRef.current?.getBoundingClientRect() ?? {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]) as DOMRect

  useRAFLoop(() => {
    if (!ctxRef.current || !song) {
      return
    }
    const state: GivenState = {
      time: getTime(),
      visualization: config.visualization,
      drawNotes: config.noteLetter,
      windowWidth: width,
      height,
      pps,
      hands: handSettings,
      hand,
      ctx: ctxRef.current,
      items: song.items,
      constrictView: !!constrictView,
      keySignature: config.keySignature ?? song.keySignature,
      timeSignature: song.timeSignature,
      canvasRect,
      selectedRange,
    }
    render(state)
  })

  return (
    <div
      style={{ position: 'absolute', width: '100%', height: '100%', touchAction: 'none' }}
      ref={measureRef}
      onPointerMove={(e) => !disableTouchscroll && touchscroll.handleMove(e.nativeEvent)}
      onPointerDown={(e) => !disableTouchscroll && touchscroll.handleDown(e.nativeEvent)}
      onPointerUp={(e) => !disableTouchscroll && touchscroll.handleUp(e.nativeEvent)}
    >
      <canvas ref={setupCanvas} width={width} height={height} />
    </div>
  )
}

export default CanvasRenderer
