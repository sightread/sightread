import { Hand, Song, SongConfig } from '@/types'
import { GivenState, render } from './canvasRenderer'
import { useRAFLoop, useSize } from '@/hooks'
import { useState, useRef, useEffect, useCallback } from 'react'
import { formatTime } from '@/utils'
import Player from '@/features/player'
import { palette } from '@/styles/common'

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
  rangeSelecting?: boolean
  setRange?: any
  onSeek?: any
}

function CanvasRenderer({
  rangeSelecting = false,
  setRange = () => {},
  onSeek = () => {},
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
  const [stopper, stopThing] = useState(false)
  function seekPlayer(clientX: number) {
    // 10 value is for better scaling
    // TODO: eliminate 10 value and move to inits below
    const progress = (clientX / height) * 10
    const songTime = progress + player.getTime()
    onSeek()
    player.seek(songTime)
  }

  useEffect(() => {
    // TODO If change directions, call getY
    if (mousePressed) {
      const wasplaying = player.isPlaying()
      if (wasplaying) player.pause()

      // init drag
      let dragY = 0
      // init acceleration
      let acceleration = 0

      const handleDown = (e: MouseEvent) => {
        // TODO: doubleclick pause / play
        dragY = e.clientY
      }
      const handleDownTouch = (e: TouchEvent) => {
        dragY = e.targetTouches[0].clientY
      }
      // calculate acceleration as dv/dt, where dt is in frames
      const velocity = (v2: number, v1: number) => {
        acceleration = v2 - v1
      }
      // init decayrate at 1 because of upwards decay
      let decayrate = 1

      // ? Good values are
      // ? f = 10, dfall = 0.015, expdec = 2 amag = 3
      // ? f = 5, dfall = 0.005, expec = 5, amag = 1.2
      // set framerate
      const framerate = 5
      // set decay falloff value, (How quickly it will come to a stop)
      const dfalloff = 0.002
      // exp decay
      // ? Disabled to remove power function, unnecessary use.
      //const expdecay = 2
      // set acceleration magnitude value (How much it scales with acceleration)
      const aMag = 0.2
      // TODO Calculate dfalloff and aMag proportionate to framerate
      const decay = (drate: number) => {
        //Delay frames

        setTimeout(() => {
          // !STOP THE ACCEL WHEN PRESSING AGAIN
          // TODO Make it more efficient, clamp values
          seekPlayer((acceleration * aMag) / drate)
          drate = drate * (1 + dfalloff)
          // Check if decay meets up with accel, ABS value because it can be neg.
          if (drate < Math.abs(acceleration) * aMag) {
            //if (!stopper)
            decay(drate)
          } else if (wasplaying) {
            player.play()
          }
        }, framerate)
      }

      const handleUp = () => {
        //stopThing(false)
        decay(decayrate)

        setMousePressed(false)
      }

      const handler = (e: MouseEvent) => {
        seekPlayer(e.clientY - dragY)
        velocity(e.clientY, dragY)
        dragY = e.clientY
      }
      const handletouch = (e: TouchEvent) => {
        seekPlayer(e.targetTouches[0].clientY - dragY)
        velocity(e.targetTouches[0].clientY, dragY)
        dragY = e.targetTouches[0].clientY
      }

      window.addEventListener('mousedown', handleDown)
      window.addEventListener('mousemove', handler)
      window.addEventListener('mouseup', handleUp)
      window.addEventListener('touchstart', handleDownTouch)
      window.addEventListener('touchmove', handletouch)
      window.addEventListener('touchend', handleUp)
      return () => {
        window.removeEventListener('mousemove', handler)
        window.removeEventListener('mouseup', handleUp)
        window.removeEventListener('mousedown', handleDown)
        window.removeEventListener('touchstart', handleDownTouch)
        window.removeEventListener('touchmove', handletouch)
        window.removeEventListener('touchend', handleUp)
      }
    }
  }, [mousePressed, rangeSelecting, player, setRange])

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
        //stopThing(true)
        setMousePressed(true)
      }}
      onTouchStart={(e) => {
        //stopThing(true)
        setMousePressed(true)
      }}
      onMouseUp={(e) => {
        //stopThing(true)
      }}
      onTouchEnd={(e) => {
        //stopThing(true)
      }}
    >
      <canvas ref={setupCanvas} width={width} height={height} />
    </div>
  )
}

export default CanvasRenderer
