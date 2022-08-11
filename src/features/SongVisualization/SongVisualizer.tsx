import { Hand, Song, SongConfig } from '@/types'
import { GivenState, render } from './canvasRenderer'
import { useRAFLoop, useSize } from '@/hooks'
import { useState, useRef, useEffect, useCallback } from 'react'
import { formatTime } from '@/utils'
import Player from '@/features/player'
import { palette } from '@/styles/common'
import { decay, velocity, seekPlayer, stopAccel } from '@/features/SongVisualization/touchscroll'

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
}

function CanvasRenderer({
  song,
  config,
  hand,
  handSettings,
  selectedRange,
  getTime,
  constrictView = true,
}: CanvasRendererProps) {
  const ctxRef = useRef<CanvasRenderingContext2D>()
  const getRectRef = useRef(() => ({} as DOMRect))
  const [mousePressed, setMousePressed] = useState(false) // TODO: mouse state shouldn't need to be ui state.
  const { width, height, measureRef } = useSize()
  const player = Player.player()

  useEffect(() => {
    // TODO If change directions, call getY
    if (mousePressed) {
      const wasplaying = player.isPlaying()
      let dragY = 0
      const handleDown = (e: MouseEvent) => {
        if (wasplaying) {
          player.pause()
        }
        // TODO: doubleclick pause / play
        dragY = e.clientY
        stopAccel()
      }
      const handleDownTouch = (e: TouchEvent) => {
        if (wasplaying) {
          player.pause()
        }
        dragY = e.targetTouches[0].clientY
        stopAccel()
      }

      const handleUp = () => {
        decay()
        if (wasplaying) {
          player.play()
        }
        setMousePressed(false)
      }

      const handler = (e: MouseEvent) => {
        seekPlayer((e.clientY - dragY) * 4)
        if (Math.abs(e.clientY - dragY) > 2) {
          velocity(e.clientY, dragY)
        } else velocity(0, 0)
        dragY = e.clientY
      }
      const handleTouch = (e: TouchEvent) => {
        seekPlayer((e.targetTouches[0].clientY - dragY) * 4)
        if (Math.abs(e.targetTouches[0].clientY - dragY) > 2) {
          velocity(e.targetTouches[0].clientY, dragY)
        } else velocity(0, 0)
        dragY = e.targetTouches[0].clientY
      }

      window.addEventListener('mousedown', handleDown)
      window.addEventListener('mousemove', handler)
      window.addEventListener('mouseup', handleUp)
      window.addEventListener('touchstart', handleDownTouch)
      window.addEventListener('touchmove', handleTouch)
      window.addEventListener('touchend', handleUp)
      return () => {
        window.removeEventListener('mousemove', handler)
        window.removeEventListener('mouseup', handleUp)
        window.removeEventListener('mousedown', handleDown)
        window.removeEventListener('touchstart', handleDownTouch)
        window.removeEventListener('touchmove', handleTouch)
        window.removeEventListener('touchend', handleUp)
      }
    }
  }, [mousePressed, player])

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
      windowWidth: width,
      height,
      pps: 225, // pixels per second
      hands: handSettings,
      hand,
      ctx: ctxRef.current,
      items: song.items,
      constrictView: !!constrictView,
      keySignature: config.keySignature ?? song.keySignature,
      timeSignature: song.timeSignature,
      canvasRect: getRectRef.current(),
      selectedRange,
    }
    render(state)
  })

  return (
    <div
      style={{ position: 'absolute', width: '100%', height: '100%' }}
      ref={measureRef}
      onMouseDown={(e) => {
        setMousePressed(true)
      }}
      onTouchStart={(e) => {
        setMousePressed(true)
      }}
    >
      <canvas ref={setupCanvas} width={width} height={height} />
    </div>
  )
}

export default CanvasRenderer
