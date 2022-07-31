import type { Song } from '@/types'

import fs from 'fs'
import { PassThrough } from 'stream'
import { Canvas } from 'skia-canvas'
import ffmpeg from 'fluent-ffmpeg'
import { render } from '@/features/SongVisualization/canvasRenderer'
import { waitForImages, getImages } from '@/features/SongVisualization/images'
import { parseMidi, parserInferHands } from '@/features/parsers'

const inputDir = '/Users/jakefried/Repos/midishare/public/download'
const outputDir = '/Users/jakefried/Movies/sightread-recordings'
const cpus = 2
const fps = 60
const viewport = { width: 1920, height: 1080 }
const density = 2
const maxSeconds = Infinity

/**
 * Parse the MIDI file at the given path into a {@link Song}.
 */
async function parse(path: string): Promise<Song> {
  var buf = new Uint8Array(fs.readFileSync(path)).buffer
  return parseMidi(buf)
}

/**
 * We need both a midi and an mp3 to render videos.
 * Verifies that all expected files are present.
 */
function verifyFiles(files: string[]) {
  const extensions = [`mp3`, `mid`]
  for (const file of files) {
    for (const extension of extensions) {
      const requirement = `${inputDir}/${file}/${file}.${extension}`
      if (!fs.existsSync(requirement)) {
        console.error(`Missing required file: ${requirement}`)
        process.exit(1)
      }
    }
    if (!fs.existsSync(`${outputDir}/${file}`)) {
      fs.mkdirSync(`${outputDir}/${file}`)
    }
  }
}

async function main() {
  const files: string[] = [
    // Force multi-line
  ]

  await step('file verification', () => {
    verifyFiles(files)
  })

  await step('render videos', async () => {
    for (const file of files) {
      if (fs.existsSync(`${outputDir}/${file}/${file}.mp4`)) {
        log(`Skipping ${file}`)
        continue
      }

      await step(`render of ${file}`, () => renderVideo(file))
    }
  })
}

async function renderVideo(file: string) {
  const song: Song = await parse(`${inputDir}/${file}/${file}.mid`)
  const hands = parserInferHands(song)

  const { items, duration } = song
  const end = Math.min(duration, maxSeconds)
  const deferred = new Deferred()

  const passthrough = new PassThrough()
  ffmpeg(passthrough)
    .inputFormat('image2pipe')
    .inputFPS(fps)
    .input(`${inputDir}/${file}/${file}.mp3`)
    .outputOptions(`-threads ${cpus}`)
    .on('progress', (progressDetails) =>
      throttledLog(`FFMPEG Timemark: ${progressDetails.timemark}`),
    )
    .on('end', function () {
      deferred.resolve()
    })
    .on('error', function (err) {
      deferred.reject(err)
      log('an error: ' + err.message + `\n happened while processing file: ${file}`)
    })
    .save(`${outputDir}/${file}/${file}.mp4`)

  await waitForImages()

  const state: any = {
    time: 0,
    drawNotes: false,
    visualization: 'falling-notes',
    width: viewport.width,
    height: viewport.height,
    pps: 225,
    hand: 'both',
    hands: { [hands.right]: { hand: 'right' }, [hands.left]: { hand: 'left' } },
    items: items,
    // constrictView: false,
    constrictView: true,
    keySignature: 'C',
    timeSignature: { numerator: 4, denominator: 4 },
    images: getImages(),
    ctx: null as any,
    canvasRect: { left: 0, top: 0 },
  }

  // Duration goes until a single frame *past* the end, just in case the mp3 has 0-noise suffix.
  // It would be weird to continue showing the pressed notes with no audio.
  // This enables us to show a frame past the last keypress.
  while (state.time < end + 1 / fps) {
    let canvas = new Canvas(viewport.width, viewport.height)
    state.ctx = canvas.getContext('2d')
    render(state)
    const jpg = canvas.toBufferSync('jpg', { density })
    passthrough.write(jpg)
    state.time += 1 / fps
    throttledLog(`Frame generation: ${Math.floor((100 * state.time) / end)}%`)
  }

  passthrough.end()
  await deferred.promise
}

let stepDepth = 0
/**
 * Perform an arbitrary function and log the amount of time taken.
 */
async function step(name: string, fn: () => void) {
  log(`Beginning ${cyan(name)}`)
  const start = Date.now()
  stepDepth++
  await fn()
  stepDepth--
  log(`Completed ${cyan(name)} in ${Date.now() - start}ms`)
}

// Rate limit a function
function throttle(fn: Function, ms: number = 10000) {
  var lastFire = 0
  return (...args: any[]) => {
    if (Date.now() - lastFire >= ms) {
      fn(...args)
      lastFire = Date.now()
    }
  }
}

function log(s: string) {
  function pad(n: number): string {
    if (n < 10) {
      return '0' + n
    }
    return n.toString()
  }
  function formatTime(d: Date) {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  }

  const indentation = '  '.repeat(stepDepth)
  const time = green(`[${formatTime(new Date())}]`)
  console.log(`${time} ${indentation}${s}`)
}
function cyan(s: string) {
  return `\x1b[36m${s}\x1b[0m`
}
function green(s: string) {
  return `\x1b[32m${s}\x1b[0m`
}

const throttledLog = throttle((s: string) => log(s))

class Deferred<T> {
  // @ts-ignore
  resolve: (v?: T) => void
  // @ts-ignore
  reject: (err: Error) => void
  promise: Promise<T>

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve as any
      this.reject = reject as any
    })
  }
}

main()
