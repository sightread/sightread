import { getKey, getOctave, isBlack, isWhite } from '@/features/theory'
import { roundRect, roundCorner } from '@/features/drawing'
import midiState from '../midi'
import { isPointerDown } from '../pointer'
import { isNumber } from '@/utils'
import { getImages } from '../SongVisualization/images'
import { isDragging } from '../SongVisualization/touchscroll'

const TEXT_FONT = 'Arial'
type Color = string
const whiteKeyBackground: Color = 'rgb(255,253,240)'

export interface PianoRollMeasurements {
  lanes: {
    [midiNote: number]: { left: number; width: number; whiteMiddle?: number }
  }
  whiteHeight: number
  blackHeight: number
  whiteNoteSeparation: number
  pianoWidth: number
}

function getBlackKeyXOffset(midiNote: number) {
  const offset = 2 / 3 - 0.5
  const blackOffsets: { [note: number]: number } = {
    1: -offset,
    3: +offset,
    6: -offset,
    8: 0, // center of a 3 grouping is still in middle
    10: +offset,
  }
  return blackOffsets[midiNote % 12]
}

export function getPianoRollMeasurements(
  width: number,
  opts?: { startNote?: number; endNote?: number },
): PianoRollMeasurements {
  const startNote = opts?.startNote ?? 21
  const endNote = opts?.endNote ?? 108
  let whiteKeysCount = 0
  for (let i = startNote; i <= endNote; i++) {
    if (isWhite(i)) {
      whiteKeysCount++
    }
  }

  const whiteWidth = width / whiteKeysCount
  const whiteHeight = Math.floor(Math.min(5 * whiteWidth, 250)) // max-height: 250
  const blackWidth = whiteWidth / 2
  const blackHeight = Math.floor(whiteHeight * (2 / 3))
  const whiteNoteSeparation = whiteWidth / 20
  const measurements: PianoRollMeasurements = {
    pianoWidth: width,
    whiteHeight,
    blackHeight,
    whiteNoteSeparation,
    lanes: {},
  }
  let whiteNotes = 0
  for (let note = startNote; note <= endNote; note++) {
    if (isBlack(note)) {
      const whiteMiddle = whiteWidth * whiteNotes
      const left = whiteMiddle - blackWidth / 2 - 2 + getBlackKeyXOffset(note) * blackWidth
      measurements.lanes[note] = { width: blackWidth, left, whiteMiddle }
    } else {
      measurements.lanes[note] = { width: whiteWidth, left: whiteWidth * whiteNotes }
      whiteNotes++
    }
  }

  return measurements
}

// x,y are top-left of the piano about to be drawn.
// height is determined by the width, since aspect ratio is guaranteed.
export function drawPianoRoll(
  ctx: CanvasRenderingContext2D,
  measurements: PianoRollMeasurements,
  pianoTopY: number,
  activeNotes: Map<number, Color>,
) {
  const { whiteHeight, whiteNoteSeparation, blackHeight, lanes } = measurements
  ctx.save()

  // Render all the white, then render all the black.
  const whiteNotes = Object.entries(lanes).filter(([midiNote]) => !isBlack(+midiNote))
  const blackNotes = Object.entries(lanes).filter(([midiNote]) => isBlack(+midiNote))

  ctx.strokeStyle = 'transparent'
  ctx.fillStyle = 'black'
  // TODO: fix magic number +5. Likely similar solution to getting rid of
  // pianoTopY kludge.
  ctx.fillRect(0, pianoTopY, measurements.pianoWidth, whiteHeight + 5)
  for (let [midiNote, lane] of whiteNotes) {
    const { left, width } = lane
    ctx.fillStyle = whiteKeyBackground
    const heightPressedOffset = activeNotes.has(+midiNote) ? 2 : 0
    const height = whiteHeight + heightPressedOffset
    roundRect(ctx, left, pianoTopY, width - whiteNoteSeparation, height, {
      topRadius: 0,
      bottomRadius: width / 10,
    })
    const isC = getKey(+midiNote) == 'C'
    if (isC) {
      const octave = getOctave(+midiNote)
      ctx.fillStyle = 'rgb(190,190,190)'
      ctx.font = `${width * 0.65}px ${TEXT_FONT}`
      const txt = `C${octave}`
      const { width: textWidth } = ctx.measureText(txt)

      ctx.textBaseline = 'bottom'
      ctx.fillText(
        txt,
        left + width / 2 - textWidth / 2 - measurements.whiteNoteSeparation / 2,
        pianoTopY + whiteHeight - 8,
      )
    }
    const activeColor = activeNotes.get(+midiNote)
    if (activeColor) {
      ctx.fillStyle = activeColor
      roundRect(ctx, left, pianoTopY, width - whiteNoteSeparation, height, {
        topRadius: 0,
        bottomRadius: width / 10,
      })
    }
  }

  for (let [midiNote, lane] of blackNotes) {
    let { left, width, whiteMiddle } = lane
    // No real reason why cornerWidth is set to white note separator.
    // Just think it looks OK.
    const cornerWidth = measurements.whiteNoteSeparation
    ctx.strokeStyle = 'transparent'
    ctx.fillStyle = 'black'
    ctx.fillRect(left - 2, pianoTopY, width + 3, blackHeight + 2)

    roundCorner(
      ctx,
      whiteMiddle! - measurements.whiteNoteSeparation - cornerWidth,
      pianoTopY + blackHeight + 1.5,
      cornerWidth + 0.2,
      cornerWidth,
      width / 4,
    )
    roundCorner(
      ctx,
      whiteMiddle! + cornerWidth,
      pianoTopY + blackHeight + 1.5,
      -cornerWidth - 0.2,
      cornerWidth,
      width / 4,
    )

    const isPressed = activeNotes.has(+midiNote)
    ctx.fillStyle = activeNotes.get(+midiNote) ?? 'black'
    const images = getImages()
    let posY = isPressed ? pianoTopY : pianoTopY - 2
    if (images.blackKeyPressed && images.blackKeyRaised) {
      let img = isPressed ? images.blackKeyPressed : images.blackKeyRaised
      ctx.drawImage(img, left, posY, width, blackHeight)
    }

    if (activeNotes.has(+midiNote)) {
      ctx.globalCompositeOperation = 'overlay'
      ctx.fillRect(left, posY, width, blackHeight)
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
    }
  }
  ctx.restore()
}

let lastPressedNote: null | number = null
export function handlePianoRollMousePress(
  measurements: PianoRollMeasurements,
  pianoTopY: number,
  point: { x: number; y: number },
) {
  if (!isPointerDown() || isDragging()) {
    if (isNumber(lastPressedNote)) {
      midiState.release(lastPressedNote)
      lastPressedNote = null
    }
    return
  }

  // Can easily optimize this later.
  const { blackHeight, whiteHeight } = measurements
  let newPressedNote: null | number = null
  for (let [midiNote, lane] of Object.entries(measurements.lanes)) {
    const { left, width } = lane
    const height = isBlack(+midiNote) ? blackHeight : whiteHeight
    const rect = { x: left, y: pianoTopY, height, width }
    if (pointIntersectsWithRect(point, rect)) {
      newPressedNote = +midiNote
      break
    }
  }
  if (
    newPressedNote &&
    !isBlack(newPressedNote) &&
    isBlack(newPressedNote + 1) &&
    newPressedNote < 108
  ) {
    const { left, width } = measurements.lanes[newPressedNote + 1]
    const rect = { x: left, y: pianoTopY, height: blackHeight, width }
    if (pointIntersectsWithRect(point, rect)) {
      newPressedNote = newPressedNote + 1
    }
  }

  if (newPressedNote == lastPressedNote) {
    return
  }

  if (isNumber(lastPressedNote)) {
    midiState.release(lastPressedNote)
    lastPressedNote = null
  }
  if (isNumber(newPressedNote)) {
    midiState.press(newPressedNote, 127 / 2)
    lastPressedNote = newPressedNote
  }
}

type Point = { x: number; y: number }
type Rect = { x: number; y: number; width: number; height: number }
function pointIntersectsWithRect(point: Point, rect: Rect): boolean {
  const doesXIntersect = rect.x <= point.x && point.x <= rect.x + rect.width
  const doesYIntersect = rect.y <= point.y && point.y <= rect.y + rect.height
  return doesXIntersect && doesYIntersect
}
