'use client'

import { useRAFLoop, useSize } from '@/hooks'
import { forwardRef, Ref, useCallback, useRef } from 'react'

type CanvasRenderFn = (
  ctx: CanvasRenderingContext2D,
  size: { width: number; height: number },
) => void

interface CanvasProps {
  render: CanvasRenderFn
  ref: Ref<HTMLCanvasElement>
}

const Canvas = forwardRef(({ render }: CanvasProps, ref) => {
  const { width, height, measureRef } = useSize()
  const ctxRef = useRef<CanvasRenderingContext2D>()
  const renderRef = useRef<CanvasRenderFn>()
  renderRef.current = render

  const setupCanvas = useCallback(
    async (canvasEl: HTMLCanvasElement) => {
      if (!canvasEl) {
        return
      }
      canvasEl.style.width = width + 'px'
      canvasEl.style.height = height + 'px'
      if (ref) {
        if (typeof ref === 'function') {
          ref(canvasEl)
        } else if ('current' in ref) {
          ;(ref as any).current = canvasEl
        }
      }

      const scale = window.devicePixelRatio ?? 1
      canvasEl.width = Math.round(width * scale)
      canvasEl.height = Math.round(height * scale)
      const ctx = canvasEl.getContext('2d')!
      ctx.scale(scale, scale)
      ctxRef.current = ctx
    },
    [width, height, ref],
  )

  useRAFLoop(() => {
    if (!ctxRef.current) {
      return
    }
    renderRef.current?.(ctxRef.current, { width, height })
  })

  return (
    <div className="relative h-full w-full" ref={measureRef}>
      <canvas ref={setupCanvas} width={width} height={height} />
    </div>
  )
})
Canvas.displayName = 'Canvas'

export default Canvas
