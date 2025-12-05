import { assetUrl } from '@/utils/assets'
import { InstrumentName, SoundFont } from './types'
import { parseMidiJsSoundfont } from './utils'

export const soundfonts: { [key in InstrumentName]?: SoundFont } = {}
const downloading: { [key in InstrumentName]?: Promise<void> } = {}

export async function loadInstrument(instrument: InstrumentName) {
  // Already downloaded.
  if (soundfonts[instrument]) {
    return Promise.resolve()
  }
  // In-progress already.
  if (downloading[instrument]) {
    return downloading[instrument]
  }

  // Original link: https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/${instrument}-mp3.js
  const soundfontUrl = assetUrl(`soundfonts/FluidR3_GM/${instrument}-mp3.js`)
  const sfFetch = fetch(soundfontUrl)

  let doneDownloadingRes: (() => void) | undefined
  downloading[instrument] = new Promise<void>((res) => {
    doneDownloadingRes = res
  })

  try {
    const response = await sfFetch
    const text = await response.text()
    const sf = await parseMidiJsSoundfont(text)
    soundfonts[instrument] = sf
    delete downloading[instrument]
    doneDownloadingRes && doneDownloadingRes()
  } catch (err) {
    console.error(`Error fetching soundfont for: ${instrument}`, err)
  }
}
