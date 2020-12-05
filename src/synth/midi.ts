import generalMidiInstruments from './instruments.json'
import { parseMidiJsSoundfont } from './utils'

const soundfonts: any = {}
const downloading: any = {}

async function loadInstruments(instruments: string[]) {
  return Promise.all(
    instruments.map(async (name) => {
      // Already downloaded.
      if (soundfonts[name]) {
        return Promise.resolve()
      }
      // In-progress already.
      if (downloading[name]) {
        return downloading[name]
      }

      const sfFetch = fetch(`https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/${name}-mp3.js`)
      downloading[name] = sfFetch
      try {
        let sf = await parseMidiJsSoundfont(await (await sfFetch).text())
        soundfonts[name] = sf
        downloading[name] = null
      } catch (err) {
        console.error(err)
        return Promise.reject(err)
      }
    }),
  )
}

function getSoundFonts() {
  return soundfonts
}

export { loadInstruments, getSoundFonts }
