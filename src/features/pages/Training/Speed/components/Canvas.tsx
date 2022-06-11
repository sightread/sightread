import { useCallback, useRef } from 'react'
import { useRAFLoop, useSize } from '@/hooks'

interface CanvasProps {
  render: (ctx: CanvasRenderingContext2D, size: { width: number; height: number }) => void
}

function Canvas({ render }: CanvasProps) {
  const { width, height, measureRef } = useSize()
  const ctxRef = useRef<CanvasRenderingContext2D>()

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
    },
    [width, height],
  )

  useRAFLoop(() => {
    if (!ctxRef.current) {
      return
    }
    render(ctxRef.current, { width, height })
  })

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }} ref={measureRef}>
      <canvas ref={setupCanvas} width={width} height={height} />
    </div>
  )
}

export default Canvas
