import { useCallback, useMemo, useRef } from 'react'
import { Hand, Song, SongConfig } from '@/types'
import { GivenState, render } from './canvasRenderer'
import { useRAFLoop, useSize } from '@/hooks'
import Player from '@/features/player'
import { getImages, waitForImages } from './images'

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
  const getRectRef = useRef(() => ({} as DOMRect))
  let canvasRect = useMemo(() => getRectRef.current(), [width, height])

  const setupCanvas = useCallback(
    async (canvasEl: HTMLCanvasElement) => {
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
      getRectRef.current = () => canvasEl.getBoundingClientRect()
      await waitForImages()
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
      showParticles: false, // disable FX for now, don't love the particle effect.
      items: song.items,
      constrictView: !!constrictView,
      keySignature: config.keySignature ?? song.keySignature,
      timeSignature: song.timeSignature,
      canvasRect,
      images: getImages(),
    }
    render(state)
  })

  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%' }} ref={measureRef}>
      <canvas ref={setupCanvas} width={width} height={height} />
    </div>
  )
}

export default CanvasRenderer
