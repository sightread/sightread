import { Canvas } from '@/components'
import * as touchscroll from '@/features/SongVisualization/touchscroll'
import { useSize } from '@/hooks'
import { Hand, Song, SongConfig } from '@/types'
import { LegacyRef, useMemo, useRef } from 'react'
import { usePlayer } from '../player'
import { GivenState, render } from './canvasRenderer'
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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const player = usePlayer()

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
      coloredNotes: config.coloredNotes,
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
      player,
    }
    render(state)
  }

  return (
    <div
      className="absolute h-full w-full touch-none"
      ref={measureRef}
      onPointerMove={(e) => enableTouchscroll && touchscroll.handleMove(player, e.nativeEvent)}
      onPointerDown={(e) => enableTouchscroll && touchscroll.handleDown(player, e.nativeEvent)}
      onPointerUp={(e) => enableTouchscroll && touchscroll.handleUp(player, e.nativeEvent)}
    >
      <Canvas ref={canvasRef as LegacyRef<HTMLCanvasElement>} render={renderCanvas} />
    </div>
  )
}

export default CanvasRenderer
