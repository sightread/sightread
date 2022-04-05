import './polyfills'

import type { Song } from '../src/types'
import { Canvas } from 'skia-canvas'
import { render } from '../src/features/SongVisualization/canvasRenderer'
import ffmpeg from 'fluent-ffmpeg'
import { PassThrough } from 'stream'
import * as os from 'os'
import { waitForImages, getImages } from '../src/features/SongVisualization/images'

async function main() {
  const outputDir = '/Users/jakefried/Movies/sightread-recordings'
  const file = 'All_Eyes_On_Me__Bo_Burnham_Easy_Piano'
  const song: Song = require(`../public/generated/music/songs/${file}.json`)

  const cpus = Math.max(1, os.cpus().length - 1)
  const fps = 60
  const viewport = { width: 1920, height: 1080 }
  const density = 1

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
    hands: { 0: { hand: 'right' }, 1: { hand: 'left' } },
    ctx: null as any,
    showParticles: false,
    items: items,
    constrictView: false,
    keySignature: 'C',
    timeSignature: { numerator: 4, denominator: 4 },
    images: getImages(),
  }

  let lastFire = Date.now()
  const end = 5
  const start = Date.now()
  while (state.time < end) {
    let canvas = new Canvas(viewport.width, viewport.height)
    state.ctx = canvas.getContext('2d')
    render(state)
    const jpg = canvas.toBufferSync('jpg', { density })
    passthrough.write(jpg)
    state.time += 1 / fps
    if (Date.now() - lastFire > 1000) {
      lastFire = Date.now()
      console.error(`Frame Generation: ${Math.floor((100 * state.time) / end)}%`)
    }
  }

  passthrough.end()
  console.log(`Entire render process took: ${Date.now() - start}ms`)
}

main()
