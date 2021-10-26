import { useCallback, useRef } from 'react'
import { Hand, Song, SongConfig } from '@/types'
import { FClefIcon, GClefIcon, SheetBraceIcon } from '@/icons'
import { GivenState, render, sheetIconProps } from './canvasRenderer'
import { useRAFLoop, useSize } from '@/hooks'
import Player from '@/features/player'

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
}

function CanvasRenderer({
  song,
  config,
  hand,
  handSettings,
  getTime,
  constrictView = true,
}: CanvasRendererProps) {
  const { width, height, measureRef } = useSize()
  const ctxRef = useRef<CanvasRenderingContext2D>()

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
    },
    [width, height],
  )

  useRAFLoop(() => {
    if (!ctxRef.current || !song) {
      return
    }
    const state: GivenState = {
      time: getTime(),
      visualization: config.visualization,
      drawNotes: config.noteLetter,
      width,
      height,
      pps: 150, // pixels per second
      hands: handSettings,
      hand,
      ctx: ctxRef.current,
      showParticles: Player.player().isPlaying(),
      items: song.items,
      constrictView: !!constrictView,
    }
    render(state)
  })

  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%' }} ref={measureRef}>
      {config.visualization === 'sheet' && (
        <>
          <GClefIcon {...sheetIconProps('treble', height)} />
          <FClefIcon {...sheetIconProps('bass', height)} />
          <SheetBraceIcon {...sheetIconProps('brace', height)} />
        </>
      )}
      <canvas ref={setupCanvas} width={width} height={height} />
    </div>
  )
}

export default CanvasRenderer