import type { Song } from '@/types'

import fs from 'fs'
import { PassThrough } from 'stream'
import { Canvas } from 'skia-canvas'
import ffmpeg from 'fluent-ffmpeg'
import { render } from '@/features/SongVisualization/canvasRenderer'
import { waitForImages, getImages } from '@/features/SongVisualization/images'
import { parseMidi, parserInferHands } from '@/features/parsers'

async function parse(path: string): Promise<Song> {
  var buf = new Uint8Array(fs.readFileSync(path)).buffer
  return parseMidi(buf)
}

async function main() {
  const outputDir = '/Users/jakefried/Movies/sightread-recordings'
  const file = 'BTS-Yet_To_Come/BTS-Yet_To_Come'
  const song: Song = await parse(`${outputDir}/${file}.mid`)
  const hands = parserInferHands(song)

  // const cpus = Math.max(1, os.cpus().length - 1)
  const cpus = 2
  const fps = 60
  const viewport = { width: 1920, height: 1080 }
  const density = 2
  const maxSeconds = Infinity

  const passthrough = new PassThrough()
  ffmpeg(passthrough)
    .inputFormat('image2pipe')
    .inputFPS(fps)
    .input(`${outputDir}/${file}.mp3`)
    .outputOptions(`-threads ${cpus}`)
    .on('progress', (progressDetails) => {
      console.log(`FFMPEG Timemark: ${progressDetails.timemark}`)
    })
    .on('end', function () {
      console.log('file has been converted succesfully')
    })
    .on('error', function (err) {
      console.log('an error happened: ' + err.message)
    })
    .save(`${outputDir}/${file}.mp4`)

  const { items, duration } = song
  await waitForImages()

  const state: any = {
    time: 0,
    drawNotes: false,
    visualization: 'falling-notes',
    width: viewport.width,
    height: viewport.height,
    pps: 150,
    hand: 'both',
    hands: { [hands.right]: { hand: 'right' }, [hands.left]: { hand: 'left' } },
    items: items,
    // constrictView: false,
    constrictView: true,
    keySignature: 'C',
    timeSignature: { numerator: 4, denominator: 4 },
    images: getImages(),
    ctx: null as any,
    canvasRect: { left: 0, top: 0 } as any,
  }

  let lastFire = Date.now()
  const start = Date.now()
  const end = Math.min(duration, maxSeconds)

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
    if (Date.now() - lastFire > 1000) {
      lastFire = Date.now()
      console.log(`Frame Generation: ${Math.floor((100 * state.time) / end)}%`)
    }
  }

  passthrough.end()
  console.log(`Entire render process took: ${Date.now() - start}ms`)
}

main()
