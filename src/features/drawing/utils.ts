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
) {
  let radius = 10
  if (width < 2 * radius) {
    radius = width / 2
  }
  if (height < 2 * radius) {
    radius = height / 2
  }
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + width, y, x + width, y + height, radius)
  ctx.arcTo(x + width, y + height, x, y + height, radius)
  ctx.arcTo(x, y + height, x, y, radius)
  ctx.arcTo(x, y, x + width, y, radius)
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
