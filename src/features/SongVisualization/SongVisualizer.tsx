import { Hand, Song, SongConfig } from '@/types'
import { GivenState, render } from './canvasRenderer'
import { useRAFLoop, useSize } from '@/hooks'
import { useState, useRef, useEffect, useCallback } from 'react'
import { formatTime } from '@/utils'
import Player from '@/features/player'
import { palette } from '@/styles/common'
import { decay, velocity, seekPlayer, stopAccel } from '@/features/SongVisualization/touchscroll'
import { pianoTop } from '@/features/SongVisualization/falling-notes'

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
  const [dragY, setDragY] = useState(0)
  const { getter } = pianoTop()
  const pheight = getter()
  const handleDown = (e: PointerEvent) => {
    if (e.y < pheight + 70) {
      const clientY = e.y
      if (player.isPlaying()) {
        player.pause()
      }
      // TODO: doubleclick pause / play
      setDragY(clientY)
      stopAccel()
    }
  }
  const handleUp = () => {
    decay()
    if (player.isPlaying()) {
      player.play()
    }
    setMousePressed(false)
  }

  // ? Scalar to determine how quickly linear scrolling works.
  // TODO: Replace with actual value
  const scalar = 4
  // ? Threshold to prevent accidental acceleration
  const threshold = 5

  const handlePointer = (e: PointerEvent) => {
    // ? 70 value is because it would get the value twice, changing it to like -70 or something.
    if (e.y < pheight + 70) {
      const clientY = e.y
      seekPlayer((clientY - dragY) * scalar)
      if (Math.abs(clientY - dragY) > threshold) {
        velocity(clientY, dragY)
      } else {
        velocity(0, 0)
      }
      setDragY(clientY)
      // ? Handleup if you want it to use acceleration even if you swipe off page.
    } else handleUp()
  }

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
      style={{ position: 'absolute', width: '100%', height: '100%', touchAction: 'none' }}
      ref={measureRef}
      onPointerMove={(e) => {
        if (mousePressed) {
          e.stopPropagation()
          handlePointer(e.nativeEvent)
        }
      }}
      onPointerDown={(e) => {
        e.stopPropagation()
        setMousePressed(true)
        handleDown(e.nativeEvent)
      }}
      onPointerUp={(e) => {
        if (mousePressed) {
          handleUp()
        }
      }}
      onPointerOut={(e) => {
        if (mousePressed) {
          handleUp()
        }
      }}
    >
      <canvas ref={setupCanvas} width={width} height={height} />
    </div>
  )
}

export default CanvasRenderer
