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

const MusicPaths = (() => {
  if (!isBrowser()) {
    return
  }

  return {
    GClef: {
      // Source: https://upload.wikimedia.org/wikipedia/commons/e/e8/G-clef.svg
      height: 75,
      width: 44,
      path2D: new Path2D(
        'M12 3.5c.4 3.2-2 5.7-4 7.7-1 1-.2.2-.7.6l-.3-2a13 13 0 0 1 4.3-8.1c.3.6.5.6.7 1.8zm.7 16.2a5.7 5.7 0 0 0-4.3-1L7.8 15c2.3-2.3 4.9-5 5-8.5 0-2.2-.2-4.7-1.6-6.5-1.7.1-3 2.2-3.8 3.4-1.5 2.7-1.2 6-.6 8.8-.8 1-2 1.8-2.7 2.7-2.4 2.4-4.5 5.5-4 9a8 8 0 0 0 9.6 7.3c.3 2.2 1 4.6.1 6.8-.7 1.6-2.7 3-4.3 2.2l-.5-.3c1.1-.3 2-1 2.3-1.6C8 37 6.9 34.7 5 35c-2 0-3 3-1.6 4.7 1.3 1.5 3.8 1.3 5.4.3 1.8-1.2 2-3.6 1.9-5.6l-.5-3.4 1.2-.4c2.7-1 4.4-4.3 3.6-7.1-.3-1.5-1-3-2.3-3.8zm.6 5.7c.2 2-1 4.3-3.1 5l-.3-1.5c-.5-2.4-.7-5-1.1-7.5 1.6-.1 3.5.6 4 2.2.3.6.4 1.2.5 1.8zM8 30.6c-2.5.2-5-1.6-5.6-4a7 7 0 0 1 .8-6.6c1.1-1.7 2.6-3 4-4.5l.6 3.4c-3 .8-5 4.7-3.2 7.4.5.8 2 2.3 2.7 1.7-1-.7-2-1.9-1.8-3.3 0-1.2 1.4-2.9 2.7-3.2.4 3 1 6.1 1.3 9a8 8 0 0 1-1.5.1z',
      ),
    },
    FClef: {
      // Source: https://upload.wikimedia.org/wikipedia/commons/c/c5/FClef.svg
      height: 20,
      width: 18,
      path2D: new Path2D(
        'M17.31 3.15c.01.36-.15.73-.43.98-.36.32-.9.4-1.36.22a1.27 1.27 0 0 1-.8-1.09 1.28 1.28 0 0 1 1.36-1.41 1.26 1.26 0 0 1 1.23 1.3zm0 5.84c.01.37-.15.74-.43.98-.36.33-.9.4-1.36.23a1.27 1.27 0 0 1-.8-1.1c-.03-.37.1-.75.36-1.02.25-.28.63-.4 1-.39.48.02.92.35 1.12.78.08.16.11.34.11.52zm-4.28-1.78a10.51 10.51 0 0 1-3.21 7.54c-2.5 2.49-5.75 4.07-9.07 5.13-.44.24-1.1-.08-.41-.4 1.34-.61 2.73-1.14 3.96-1.96 2.72-1.68 5.02-4.33 5.57-7.56.33-1.96.24-4-.25-5.94-.36-1.42-1.35-2.88-2.9-3.1a4.61 4.61 0 0 0-3.93 1.3 2.53 2.53 0 0 0-.7 1.87c.6-.47.57-.42 1.06-.64a2.2 2.2 0 0 1 2.93 1.47c.3 1.15.07 2.61-1.07 3.22-1.18.65-2.93.38-3.6-.89A4.81 4.81 0 0 1 2.7 1.27C4.5-.23 7.13-.3 9.25.48c2.19.81 3.49 3.08 3.7 5.32.06.47.08.94.08 1.41z',
      ),
    },
    CurlyBrace: {
      // Source: https://upload.wikimedia.org/wikipedia/commons/e/ec/Curly_bracket_left.svg
      width: 23,
      height: 232,
      path2D: new Path2D(
        'm18 5.5 2-3L21 1l-3 1-4.5 5-3 6-2 5-1 4-1 7-.5 7v12l2 15.5 1.5 8 1 10.5v12.5l-.5 4-.5 3-1 3L6 110l-2 3.5-2 2h2.5l.5-.5 6-10.5L14.5 94c.4-1.2 1.17-5.5 1.5-7.5l.5-8.5v-5l-.5-5.5-1-8.5-2-15.5-1-10c-.5-5 0-9 0-9.5s.5-4.5 1-6.5c.4-1.6 1.17-4 1.5-5l1-2.5 1-2L18 5.5Zm-13 115L2.5 117l-.5-.5h2.5l5 5.5 3 6 2 5 1 4 1 7 .5 7v12l-2 15.5-1.5 8-1 10.5v12.5l.5 4 .5 3 1 3L17 225l2 3.5 2 2-2-.5-1-1-6-9.5L8.5 209c-.4-1.2-1.17-5.5-1.5-7.5l-.5-8.5v-5l.5-5.5 1-8.5 2-15.5 1-10c.5-5 0-9 0-9.5s-.5-4.5-1-6.5c-.4-1.6-1.17-4-1.5-5l-1-2.5-1-2-1.5-2.5Z',
      ),
    },
    Note: {
      width: 42,
      height: 43,
      path2D: new Path2D(
        'M22.4811 6.42107C24.4811 10.4211 21.0371 15.6763 15.4811 17.9211C9.48114 19.9211 5.48114 18.921 2.98114 15.421C1.48114 11.421 4.48114 6.92102 10.0411 3.9855C15.9811 2.42107 20.4811 2.42107 22.4811 6.42107Z',
      ),
    },
    Sharp: {
      // Source: https://upload.wikimedia.org/wikipedia/commons/a/a6/Sharp.svg
      width: 6,
      height: 9,
      path2D: new Path2D(
        'M1.9 12.15v-4.7l2-.55v4.68l-2 .57zm3.94-1.13-1.37.39V6.73l1.37-.38V4.4l-1.37.39V0H3.9v4.93l-2 .58V.86h-.53v4.82L0 6.07v1.95l1.38-.39v4.67L0 12.7v1.94l1.38-.39V19h.53v-4.93l2-.55v4.63h.56v-4.8l1.37-.39v-1.94z',
      ),
    },
  }
})()!

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
