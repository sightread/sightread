export function line(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  options?: { topRadius?: number; bottomRadius?: number },
) {
  const radius = 10
  let topR = options?.topRadius ?? radius
  let bottomR = options?.bottomRadius ?? radius
  if (width <= 2 * topR || height <= 2 * topR) {
    topR = Math.min(width, height) / 2
  }
  if (width <= 2 * bottomR || height <= 2 * bottomR) {
    bottomR = Math.min(width, height) / 2
  }

  ctx.beginPath()
  ctx.moveTo(x + topR, y)
  ctx.arcTo(x + width, y, x + width, y + height, topR)
  ctx.arcTo(x + width, y + height, x, y + height, bottomR)
  ctx.arcTo(x, y + height, x, y, bottomR)
  ctx.arcTo(x, y, x + width, y, topR)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
}

export function circle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
) {
  x = Math.round(x)
  y = Math.round(y)
  ctx.fillStyle = color
  ctx.fillRect(x, y, radius, radius) // if the object is small use rect instead of circle
}

export function drawPaths(
  ctx: CanvasRenderingContext2D,
  pathObj: { width: number; height: number; path2d: Path2D },
  x: number,
  y: number,
  opts?: { width?: number; height?: number; color?: string },
) {
  const { width, height, color } = opts ?? {}
  ctx.save()
  ctx.translate(x, y)
  if (color) {
    ctx.fillStyle = color
  }
  if (width || height) {
    let widthRatio = 1
    let heightRatio = 1
    if (width) {
      widthRatio = width / pathObj.width
      // Assume autoscale
      if (!height) {
        heightRatio = widthRatio
      }
    }
    if (height) {
      heightRatio = height / pathObj.height
      if (!width) {
        widthRatio = heightRatio
      }
    }
    ctx.scale(widthRatio, heightRatio)
  }
  ctx.fill(pathObj.path2d)
  ctx.restore()
}
