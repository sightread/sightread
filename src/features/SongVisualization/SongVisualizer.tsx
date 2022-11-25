import { Hand, Song, SongConfig } from '@/types'
import { GivenState, render } from './canvasRenderer'
import { useSize } from '@/hooks'
import { useRef, useMemo } from 'react'
import * as touchscroll from '@/features/SongVisualization/touchscroll'
import { PIXELS_PER_SECOND as pps } from './utils'
import { Canvas } from '@/components'

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
  enableTouchscroll?: boolean
  game?: boolean
}

function CanvasRenderer({
  song,
  config,
  hand,
  handSettings,
  selectedRange,
  getTime,
  constrictView = true,
  enableTouchscroll = false,
  game = false,
}: CanvasRendererProps) {
  const { width, height, measureRef } = useSize()
  const canvasRef = useRef<HTMLCanvasElement>()

  const canvasRect: DOMRect = useMemo(() => {
    return canvasRef.current?.getBoundingClientRect() ?? {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]) as DOMRect

  function renderCanvas(ctx: CanvasRenderingContext2D, { width, height }: any) {
    if (!song) {
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
      ctx,
      items: song.items,
      constrictView: !!constrictView,
      keySignature: config.keySignature ?? song.keySignature,
      timeSignature: song.timeSignature,
      canvasRect,
      selectedRange,
      game,
    }
    render(state)
  }

  return (
    <div
      className="absolute w-full h-full touch-none"
      ref={measureRef}
      onPointerMove={(e) => enableTouchscroll && touchscroll.handleMove(e.nativeEvent)}
      onPointerDown={(e) => enableTouchscroll && touchscroll.handleDown(e.nativeEvent)}
      onPointerUp={(e) => enableTouchscroll && touchscroll.handleUp(e.nativeEvent)}
    >
      <Canvas ref={canvasRef} render={renderCanvas} />
    </div>
  )
}

export default CanvasRenderer
