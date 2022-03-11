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

const radius = 10
const noteCornerRadius = {
  tl: radius,
  tr: radius,
  bl: radius,
  br: radius,
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  if (height < radius) {
    ctx.fillRect(x, y, width, height > 2 ? height : 2)
    return
  }
  const getCornerRadii = () => {
    if (width > radius) {
      return noteCornerRadius
    }
    const r = width - 1
    return { tl: r, tr: r, bl: r, br: r }
  }
  const { tl, tr, bl, br } = getCornerRadii()

  ctx.beginPath()
  ctx.moveTo(x + tl, y)
  ctx.lineTo(x + width - tr, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + tr)
  ctx.lineTo(x + width, y + height - br)
  ctx.quadraticCurveTo(x + width, y + height, x + width - br, y + height)
  ctx.lineTo(x + bl, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - bl)
  ctx.lineTo(x, y + tl)
  ctx.quadraticCurveTo(x, y, x + tl, y)
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

function drawPaths(
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
